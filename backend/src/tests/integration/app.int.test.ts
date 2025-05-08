import request from "supertest";
import { AppDataSource } from "../../config/data-source"; 
import app from "../../app";
import { DataType } from "../../entities/fields";

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  await AppDataSource.initialize();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

beforeEach(async () => {
  await AppDataSource.synchronize(true);
});

describe("Integração /campos e /preenchimentos", () => {
  let campoId: string;
  let preenchimentoId: string;

  it("POST /campos → cria campo e GET /campos lista com fills vazios", async () => {
    const payload = { name: "idade", datatype: DataType.NUMBER };
    const resPost = await request(app)
      .post("/campos")
      .send(payload)
      .expect(201);

    expect(resPost.body).toMatchObject({
      id: expect.any(String),
      name: "idade",
      datatype: "number",
      fills: [],
    });
    campoId = resPost.body.id;

    const resGet = await request(app)
      .get("/campos")
      .expect(200);

    expect(resGet.body).toHaveLength(1);
    expect(resGet.body[0]).toMatchObject({
      name: "idade",
      fills: [],
    });
  });

  it("POST /campos com nome duplicado → 400 Bad Request", async () => {
    const payload = { name: "idade", datatype: DataType.NUMBER };
    await request(app).post("/campos").send(payload).expect(201);

    await request(app)
      .post("/campos")
      .send(payload)
      .expect(400)
      .then((res) => {
        expect(res.body.message).toBe("Esse nome já existe");
      });
  });

  it("PUT /campos/:id → atualiza nome/datatype e DELETE /campos/:id → remove (e cascata de fills)", async () => {
    const { body } = await request(app)
      .post("/campos")
      .send({ name: "altura", datatype: DataType.NUMBER })
      .expect(201);
    campoId = body.id;

    const fillRes = await request(app)
      .post("/preenchimentos")
      .send({ fieldId: campoId, value: "180" })
      .expect(201);
    preenchimentoId = fillRes.body.id;

    const newData = { name: "peso", datatype: DataType.NUMBER };
    const putCampo = await request(app)
      .put(`/campos/${campoId}`)
      .send(newData)
      .expect(200);
    expect(putCampo.body).toMatchObject({
      id: campoId,
      name: "peso",
      datatype: "number",
    });

    const getAfterPut = await request(app).get("/campos").expect(200);
    expect(getAfterPut.body[0].name).toBe("peso");

    await request(app).delete(`/campos/${campoId}`).expect(204);

    const getAfterDel = await request(app).get("/campos").expect(200);
    expect(getAfterDel.body).toHaveLength(0);

    const getFillsAfterCascade = await request(app)
      .get("/preenchimentos")
      .expect(200);
    expect(getFillsAfterCascade.body).toHaveLength(0);
  });

  it("POST /preenchimentos → cria preenchimento e GET /preenchimentos retorna join", async () => {
    const campo = await request(app)
      .post("/campos")
      .send({ name: "ativo", datatype: DataType.BOOLEAN })
      .expect(201);
    campoId = campo.body.id;

    const fillPayload = { fieldId: campoId, value: "true" };
    const resFill = await request(app)
      .post("/preenchimentos")
      .send(fillPayload)
      .expect(201);

    expect(resFill.body).toMatchObject({
      id: expect.any(String),
      fieldId: campoId,
      value: "true",
    });
    preenchimentoId = resFill.body.id;

    const resList = await request(app)
      .get("/preenchimentos")
      .expect(200);

    expect(resList.body).toHaveLength(1);
    expect(resList.body[0]).toMatchObject({
      value: "true",
      field: {
        id: campoId,
        name: "ativo",
        datatype: "boolean",
      },
    });
  });

  it("POST /preenchimentos com tipo inválido → 400", async () => {
    const campo = await request(app)
      .post("/campos")
      .send({ name: "dataEvento", datatype: DataType.DATE })
      .expect(201);

    await request(app)
      .post("/preenchimentos")
      .send({ fieldId: campo.body.id, value: "not-a-date" })
      .expect(400)
      .then((res) => {
        expect(res.body.message).toMatch(/formato de data inválido/i);
      });
  });

  it("PUT /preenchimentos/:id → atualiza value e DELETE /preenchimentos/:id → remove", async () => {
    const campo = await request(app)
      .post("/campos")
      .send({ name: "altura2", datatype: DataType.NUMBER })
      .expect(201);
    campoId = campo.body.id;

    const fill = await request(app)
      .post("/preenchimentos")
      .send({ fieldId: campoId, value: "100" })
      .expect(201);
    preenchimentoId = fill.body.id;

    const upd = await request(app)
      .put(`/preenchimentos/${preenchimentoId}`)
      .send({ value: "110" })
      .expect(200);
    expect(upd.body).toMatchObject({
      id: preenchimentoId,
      value: "110",
    });

    const listAfterUpd = await request(app)
      .get("/preenchimentos")
      .expect(200);
    expect(listAfterUpd.body[0].value).toBe("110");

    await request(app)
      .delete(`/preenchimentos/${preenchimentoId}`)
      .expect(204);

    const listAfterDel = await request(app)
      .get("/preenchimentos")
      .expect(200);
    expect(listAfterDel.body).toHaveLength(0);
  });
});
