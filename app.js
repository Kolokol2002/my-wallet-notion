const express = require("express");
const date = new Date();
const { Client } = require("@notionhq/client");

const app = express();
app.use(express.json());

app.use(express.static("public"));

const notion = new Client({
  auth: "secret_mGHc8wQ6V7NVZ0eRzIF9km0UKLupyzPEgNVnn7yz0uz",
});

const urkMonth = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];

async function getCurrentLinkOfMonth() {
  const myPage = await notion.databases.query({
    database_id: "67857db90ccc4aa79e19815b2a1ab111",
  });

  const test = myPage.results.map((item) => {
    const allMonth = item.properties.Month.title[0].text.content;
    const allMonthLink = item.url;

    return {
      name: allMonth,
      link: allMonthLink,
    };
  });

  const currentMonth = urkMonth[date.getMonth()];

  const foundMonth = test.find((month) => month.name === currentMonth).link;
  const rewLink = foundMonth.split("/")[3];

  return rewLink;
}

async function getAllCaregories() {
  const myPage = await notion.databases.retrieve({
    database_id: "eb90ede7155a4c5697758bc3b563ba7b",
  });
  const res = myPage.properties.Categories.select.options.map(
    (item) => item.name
  );

  return res;
}

async function getBalance() {
  const myPage = await notion.databases.query({
    database_id: "67857db90ccc4aa79e19815b2a1ab111",
  });
  const myBalance = myPage.results.reduce((count, item) => {
    const test = item.properties.Balance.formula.number;
    return (count += test);
  }, 0);

  return myBalance;
}

async function postNewCheck(area, amount, category, note) {
  const linkMonth = await getCurrentLinkOfMonth();
  const myPage = await notion.pages.create({
    icon: {
      type: "external",
      external: {
        url:
          area === "Дохід"
            ? "https://www.notion.so/icons/arrow-up-basic_green.svg"
            : "https://www.notion.so/icons/arrow-down-basic_red.svg",
      },
    },
    parent: {
      type: "database_id",
      database_id: "eb90ede7155a4c5697758bc3b563ba7b",
    },
    properties: {
      Amount: {
        title: [
          {
            text: {
              content: "₴" + amount,
            },
          },
        ],
      },
      Categories: {
        select: {
          name: category,
        },
      },
      Area: {
        select: {
          name: area,
        },
      },
      Notes: {
        rich_text: [
          {
            text: {
              content: note,
            },
          },
        ],
      },
      Month: {
        relation: [
          {
            id: linkMonth,
          },
        ],
      },
    },
  });

  //   return res;
}

app.get("/", (req, res) => {
  res.send("Hey this is my API running 🥳");
});

app.get("/api/categories", async function (req, res) {
  const categories = await getAllCaregories();
  res.send(categories);
});

app.get("/api/balance", async function (req, res) {
  const balance = await getBalance();
  res.send(`${balance}`);
});

app.post("/api/users", async function (req, res) {
  if (!req.body) return res.sendStatus(400);

  const amount = req.body.amount;
  const category = req.body.category;
  const area = req.body.area;
  const note = req.body.note;

  const resp = await postNewCheck(area, amount, category, note);

  res.send(resp);
});

app.listen(3000, function () {
  console.log("Сервер ожидает подключения...");
});

module.exports = app;
