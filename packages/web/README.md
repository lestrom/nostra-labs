## Starting Up the Frontend

To start up the frontend, follow these steps:

1. **Install Dependencies**: Make sure you have `pnpm` installed. If not, you can install it globally using npm:

   ```bash
   npm install -g pnpm
   ```

2. **Navigate to the Project Directory**: Open your terminal and navigate to the `web` package directory:

   ```bash
   cd /Users/legape/workspaces/private/nostra-labs/packages/web
   ```

3. **Install Project Dependencies**: Run the following command to install all the necessary dependencies:

   ```bash
   pnpm install
   ```

4. **Start the Development Server**: Use the following command to start the Vite development server:

   ```bash
   pnpm dev
   ```

5. **Open Your Browser**: Once the development server is running, open your browser and navigate to:
   ```
   http://localhost:3000
   ```

You should now see your React application running with hot module replacement (HMR) enabled.

## Building for Production

To build the project for production, run the following command:

```bash
pnpm build
```

This will create an optimized production build in the `dist` directory.

## Running ESLint

To run ESLint and check for any linting errors, use the following command:

```bash
pnpm lint
```

This will run ESLint based on the configuration provided in the `eslint.config.js` file.
