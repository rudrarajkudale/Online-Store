require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateDemoData() {
  const shopOwners = [];
  const regularUsers = [];

  for (let i = 0; i < 5; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    let fullName = `${firstName} ${lastName} Store Owner`;

    while (fullName.length < 20) fullName += ` ${faker.person.lastName()}`;
    if (fullName.length > 60) fullName = fullName.substring(0, 60);

    shopOwners.push({
      name: fullName,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      address: faker.location.streetAddress(),
      password: await bcrypt.hash(String(i + 1), 10), // Passwords 1 to 5
      role: 'store owner'
    });
  }

  for (let i = 0; i < 3; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    let fullName = `${firstName} ${lastName} Regular User`;

    while (fullName.length < 20) fullName += ` ${faker.person.lastName()}`;
    if (fullName.length > 60) fullName = fullName.substring(0, 60);

    regularUsers.push({
      name: fullName,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      address: faker.location.streetAddress(),
      password: await bcrypt.hash(String(i + 6), 10), // Passwords 6 to 8
      role: 'user'
    });
  }

  return { shopOwners, regularUsers };
}

async function insertDemoData() {
  let connection;
  try {
    connection = await pool.getConnection();

    const { shopOwners, regularUsers } = await generateDemoData();

    const insertedShopOwnerIds = [];
    const insertedUserIds = [];

    console.log('Inserting shop owners...');
    for (const owner of shopOwners) {
      const [result] = await connection.query(
        'INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)',
        [owner.name, owner.email, owner.address, owner.password, owner.role]
      );
      insertedShopOwnerIds.push(result.insertId);
    }

    console.log('Inserting regular users...');
    for (const user of regularUsers) {
      const [result] = await connection.query(
        'INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)',
        [user.name, user.email, user.address, user.password, user.role]
      );
      insertedUserIds.push(result.insertId);
    }

    const storeTypes = [
      'Boutique', 'Grocery', 'Electronics', 'Bookstore', 'Clothing',
      'Hardware', 'Pharmacy', 'Jewelry', 'Sports', 'Furniture'
    ];

    const stores = [];
    console.log('Inserting stores...');
    for (let i = 0; i < 10; i++) {
      const ownerIndex = Math.floor(i / 2);
      const storeType = storeTypes[getRandomInt(0, storeTypes.length - 1)];
      const ownerName = shopOwners[ownerIndex].name.split(' ')[0];
      let storeName = `${ownerName}'s ${storeType} Store`;

      while (storeName.length < 20) {
        storeName += ` ${faker.commerce.productAdjective()}`;
      }
      if (storeName.length > 60) {
        storeName = storeName.substring(0, 60);
      }

      const email = faker.internet.email({ firstName: storeName.replace(/\s+/g, '') });
      const address = faker.location.streetAddress();
      const user_id = insertedShopOwnerIds[ownerIndex];

      const [result] = await connection.query(
        'INSERT INTO stores (name, email, address, user_id) VALUES (?, ?, ?, ?)',
        [storeName, email.toLowerCase(), address, user_id]
      );
      stores.push({ id: result.insertId });
    }

    console.log('Inserting reviews...');
    for (let i = 0; i < 20; i++) {
      const userIndex = i % insertedUserIds.length;
      const storeIndex = getRandomInt(0, stores.length - 1);

      await connection.query(
        'INSERT INTO reviews (store_id, user_id, rating, message) VALUES (?, ?, ?, ?)',
        [
          stores[storeIndex].id,
          insertedUserIds[userIndex],
          getRandomInt(1, 5),
          faker.lorem.paragraph().substring(0, 500)
        ]
      );
    }

    console.log('✅ Demo data inserted successfully!');
  } catch (error) {
    console.error('❌ Error inserting demo data:', error);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

insertDemoData();
