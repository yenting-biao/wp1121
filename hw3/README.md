# WP HW3

## Running the app

1. Install dependencies

```bash
yarn install
```

2. Create a `.env.local` file in the root of the project and add a valid Postgres URL. To get a Postgres URL, follow the instructions [here](https://ric2k1.notion.site/Free-postgresql-tutorial-f99605d5c5104acc99b9edf9ab649199?pvs=4). (Or you can use other way to set up the database. Just to make sure that you set up the database correctly.)
   Please note that the database name is "countMeIn".

```bash
POSTGRES_URL="postgres://postgres:postgres@localhost:5432/countMeIn"
```

3. Run the migrations

```bash
yarn migrate
```

4. Start the app

```bash
yarn dev
```

## Explanation

I implemented the perfect request. You can check it in the activity details page. Click one block to select it. Please select it one by one.
