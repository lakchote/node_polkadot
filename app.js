const express = require("express");
const app = express();

require("dotenv").config();

const port = process.env.PORT || 1337;

app.use(express.json());

const polkadotRouter = require("./routes/polkadot");
app.use("/polkadot", polkadotRouter);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
