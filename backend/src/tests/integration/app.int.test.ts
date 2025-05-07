import request from "supertest";
import { AppDataSource } from "../../config/data-source"; 
import app from "../../app";
import { Field, DataType } from "../../entities/fields";
//import { Fill } from "../../entities/fills";

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
        expect(res.body.message).toMatch(/já existe um campo/i);
      });
  });

  it("POST /preenchimentos → cria preenchimento e GET /preenchimentos retorna join", async () => {
    const campo = await request(app)
      .post("/campos")
      .send({ name: "ativo", datatype: DataType.BOOLEAN })
      .expect(201);

    const fieldId = campo.body.id;

    const fillPayload = { fieldId, value: "true" };
    const resFill = await request(app)
      .post("/preenchimentos")
      .send(fillPayload)
      .expect(201);

    expect(resFill.body).toMatchObject({
      id: expect.any(String),
      fieldId,
      value: "true",
    });

    const resList = await request(app)
      .get("/preenchimentos")
      .expect(200);

    expect(resList.body).toHaveLength(1);
    expect(resList.body[0]).toMatchObject({
      value: "true",
      field: {
        id: fieldId,
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
});
