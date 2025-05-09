# Teste Técnico Brasão Sistemas

**Status do Projeto:** Finalizado ✔️
## Link [Produção](https://node-react-brasao-v37a.vercel.app/)
* Frontend - Vercel
* Backend - Render

## Descrição

Esta aplicação implementa um sistema de CRUD (Criar, Ler, Atualizar, Deletar) para gerenciar "campos" e seus respectivos "preenchimentos". A principal característica é que cada campo pode possuir múltiplos preenchimentos, e cada preenchimento é validado de acordo com um tipo de dado específico (ex: texto, número, data, etc.) associado ao campo ao qual pertence.

## Funcionalidades Principais

* Criação, leitura, atualização e exclusão de Campos.
* Criação, leitura, atualização e exclusão de Preenchimentos associados a Campos.
* Validação dos dados de Preenchimento com base no tipo de dado definido no Campo.
* Interface de usuário interativa para gerenciamento dos dados.
* Documentação da API gerada automaticamente e acessível via Swagger.

## Tecnologias Utilizadas

* **Backend:**
    * Node.js
    * Express.js
    * Zod (para validação de dados)
    * Jest (para testes)
* **Frontend:**
    * React
    * Tailwind CSS
    * Shadcn/ui
    * Zod (para validação de dados)
    * Vitest (para testes)
* **Containerização:**
    * Docker
    * Docker Compose
* **Controle de Versão:**
    * Git

## Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina:

* [Node.js](https://nodejs.org/en/) (versão LTS recomendada)
* [Docker](https://www.docker.com/get-started)
* [Git](https://git-scm.com/)

## Como Instalar e Executar

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/arturfurtado/node-react-brasao.git

    cd node-react-brasao
    ```

2.  **Backend:**
    * Navegue até a pasta do backend:
        ```bash
        cd backend
        ```
    * Instale as dependências:
        ```bash
        npm install
        ```
        Crie um arquivo .env e copie a .env.example para facilitar o processo:
        ```bash
        touch .env
        cp .env.example .env
        ```
    * Suba os containers Docker (isso irá construir a imagem e iniciar o serviço do backend e o banco de dados, configurados em `docker-compose.yml`):
        ```bash
        docker compose up --build
        ```
    O backend estará rodando em `http://localhost:4000`.

    Para rodar os testes, acesse o diretório `backend/src/` e execute:
    ```bash
    npm run test


3.  **Frontend:**
    * Em um **novo terminal**, navegue até a pasta do frontend (a partir da raiz do projeto `node-react-brasao`):
        ```bash
        cd frontend 
        ```
        (Se você ainda estiver na pasta `backend`, use `cd ../frontend`)
    * Instale as dependências:
        ```bash
        npm install
        ```
    * Inicie o servidor de desenvolvimento do frontend:
        ```bash
        npm run dev
        ```
    A aplicação frontend estará acessível em `http://localhost:5173` (ou outra porta indicada pelo Vite).

    Para rodar os testes, acesse o diretório `frontend/` e execute:
    ```bash
    npm run test


## Executando os Testes

Para rodar os testes automatizados:

* **Backend (Jest):**
    No diretório `backend/src`:
    ```bash
    npm run test
    ```

* **Frontend (Vitest):**
    No diretório `frontend/`:
    ```bash
    npm run test
    ```

## Documentação da API

A documentação dos endpoints da API (gerada com Swagger/OpenAPI) está disponível em:

* [http://localhost:4000/docs](http://localhost:4000/docs)

(Após o backend estar em execução)
