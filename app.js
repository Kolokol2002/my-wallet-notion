const express = require("express");

const app = express();
app.use(express.json());

app.use(express.static("public"));

const { Client } = require("@notionhq/client");
const date = new Date();

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

const notion = new Client({
  auth: "secret_mGHc8wQ6V7NVZ0eRzIF9km0UKLupyzPEgNVnn7yz0uz",
});

const usersTest = [
  "Сашуня",
  "Для дудки",
  "Тралік",
  "Фаст Фуд",
  "Продукти",
  "Мийка",
  "Пальне",
  "Приколюхи",
  "Обслуговування Авто",
  "Невідома Витрата",
  "Хтось вернув",
  "ЗП Хайп",
  "Дав тато",
  "Чай",
  "Невідомий Дохід",
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
  //   console.log(rewLink);
  return rewLink;
}

async function getAllCaregories() {
  const myPage = await notion.databases.retrieve({
    database_id: "eb90ede7155a4c5697758bc3b563ba7b",
  });
  const res = myPage.properties.Categories.select.options.map(
    (item) => item.name
  );

  //   console.log(res);
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

  console.log(myBalance);

  return myBalance;
}

async function postNewCheck(area, amount, category) {
  //   const category = await getAllCaregories();
  const linkMonth = await getCurrentLinkOfMonth();
  const myPage = await notion.pages.create({
    icon: {
      type: "external",
      external: {
        url: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1065&q=80",
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
      Month: {
        relation: [
          {
            id: linkMonth,
          },
        ],
      },
    },
  });

  console.log(myPage);
  //   return res;
}

app.get("/", (req, res) => {
  res.send("Hey this is my API running 🥳");
});

app.get("/api/users", function (_, res) {
  res.send(usersTest);
});
// получение одного пользователя по id
app.get("/api/categories", async function (req, res) {
  const categories = await getAllCaregories();
  res.send(categories);
});
app.get("/api/balance", async function (req, res) {
  const balance = await getBalance();
  res.send(`${balance}`);
});
// получение отправленных данных
app.post("/api/users", async function (req, res) {
  if (!req.body) return res.sendStatus(400);

  const amount = req.body.amount;
  const category = req.body.category;
  const area = req.body.area;
  // const notes = req.body.notes;

  const resp = await postNewCheck(area, amount, category);

  res.send(resp);
});

app.listen(3000, function () {
  console.log("Сервер ожидает подключения...");
});

module.exports = app;
