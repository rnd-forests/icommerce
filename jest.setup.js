const { createPgConnection } = require('@lib/server');

const sequelize = createPgConnection(null);

global.jestSequelize = sequelize;

// Sequelize expects the "namespace" to essentially be a map with a "run" method.
// https://github.com/sequelize/sequelize/blob/2fe980e2bc3f495ed1ccdc9ee2debb112cd3ddd5/lib/sequelize.js#L1119-L1124
const cls = new Map();
Object.defineProperty(cls, 'run', {
  value: fn => {
    fn(this);
    return this;
  },
});

const wrapFn = fn => async () => {
  const txn = await sequelize.transaction();
  // Patch the behavior that Sequelize expects when using the CLS-hooked lib to manage namespaced transactions.
  // https://github.com/sequelize/sequelize/blob/c77b1f3a6c4840e4e846042c9c330dba2408b86c/lib/transaction.js#L134-L136
  // @ts-ignore
  sequelize.constructor['_cls'] = cls;
  // @ts-ignore
  sequelize.constructor['_cls'].set('transaction', txn);

  try {
    await fn();
    // This catch is not actually useless: using try/catch/finally forces `txn.rollback()`
    // to be called regardless of errors in the tests.
    // Otherwise, failing tests will hang and not produce useful output
    // eslint-disable-next-line no-useless-catch
  } catch (e) {
    throw e;
  } finally {
    await txn.rollback();
  }
};

// create new object with identical props to original test/it
const jestIt = it;
const patchedBase = (name, fn, timeout) => jestIt(name, wrapFn(fn), timeout);
const patchedOnly = (name, fn, timeout) => jestIt.only(name, wrapFn(fn), timeout);
Object.setPrototypeOf(patchedBase, it);
Object.setPrototypeOf(patchedOnly, it.only);
patchedBase.only = patchedOnly;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
test = it = patchedBase;

afterAll(async () => {
  await sequelize.close();
});

module.exports = { sequelize };
