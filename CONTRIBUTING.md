# Contributing Guide

## Setting Up the Development Environment

### Dev Container

We recommend using the Dev Container setup for a consistent development environment. Follow these steps:

1. Install [Docker](https://www.docker.com/get-started) on your machine.
2. Install [Visual Studio Code](https://code.visualstudio.com/).
3. Install the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension.
4. Open the project in Visual Studio Code.
5. Open the command palette by pressing `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac).
6. Type `Dev-Containers: Reopen in Container` and select it from the list.

### Manual Setup

If you prefer to set up the development environment manually, follow these steps:

1. Install folowing tools:

   - [Node.js](https://nodejs.org/)
   - [Bun](https://bun.sh/)

   Refer to the [`.tool-versions`](./.tool-versions) file for the required versions.

2. Clone the repository:

   ```sh
   git clone https://github.com/tus-project-team/program-grading-system.git
   cd program-grading-system
   ```

3. Install the dependencies:

   ```sh
   bun install
   ```

## Coding Guidelines

### Code Style

- Follow the coding style defined by ESLint and Prettier.
- Run the following commands to check and fix code style issues:

  1. Lint the code:

     ```sh
     bun run lint:write
     ```

  2. Format the code:

     ```sh
     bun run format:write
     ```

### Commit Messages

- Use clear and descriptive commit messages.
- Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

## Development

### Quick Start

#### Backend

Navigate to the `backend` directory and use the following commands:

1. Install dependencies:

   ```sh
   bun install
   ```

2. Start the development server:

   ```sh
   bun run dev
   ```

#### Frontend

Navigate to the `frontend` directory and use the following commands:

1. Install dependencies:

   ```sh
   bun install
   ```

2. Start the development server:

   ```sh
   bun run dev
   ```

### Running Tests

#### Backend

To run tests for the backend, navigate to the `backend` directory and run:

```sh
bun run test
```

### Commands

#### Backend

Navigate to the `backend` directory and use the following commands:

- Install dependencies:

  ```sh
  bun install
  ```

- Start the development server:

  ```sh
  bun run dev
  ```

- Build the project:

  ```sh
  bun run build
  ```

- Lint the code:

  ```sh
  bun run lint
  ```

- Format the code:

  ```sh
  bun run format
  ```

#### Frontend

Navigate to the `frontend` directory and use the following commands:

- Install dependencies:

  ```sh
  bun install
  ```

- Start the development server:

  ```sh
  bun run dev
  ```

- Build the project:

  ```sh
  bun run build
  ```

- Lint the code:

  ```sh
  bun run lint
  ```

- Format the code:

  ```sh
  bun run format
  ```

## Making Pull Requests

1. Clone the repository.

2. Create a new branch for your feature or bugfix:

   ```sh
   git checkout -b feature/issue-123
   ```

3. Make your changes.

4. Commit your changes with a clear and descriptive commit message.

5. Push your changes

   ```sh
   git push origin feature/issue-123
   ```

6. Open a pull request on GitHub.

7. Ensure that your pull request passes all CI checks.
