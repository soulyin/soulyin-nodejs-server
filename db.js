'use strict';

const mysql = require('mysql');
const _dbconfigs = require('./config/db');

// 所有 DB 实例
const _instances = {};

// 测试标识
let _istest = false;

class DB {
  /**
   * 构造函数
   */
  constructor(shard) {
    const dbconfig = _dbconfigs[shard];

    if (!dbconfig) {
      return false;
    }

    this.conn = mysql.createConnection({
      host: dbconfig.host,
      port: dbconfig.port,
      user: dbconfig.user,
      password: dbconfig.password,
      database: dbconfig.database,
      charset: 'utf8mb4'
    });
    // this.conn.connect();
  }
  /**
   * 获取数据库实例：这里使用了单例模式，避免创建多个连接
   * @param {String} shard 数据库类型或连接分区，如“r”表示可读，“w”表示可写，'user-3-r'代表某个分区
   */
  static instance(shard) {
    shard = _istest ? 'test' : shard;
    shard = shard || 'w';
    if (_instances[shard]) {
      return _instances[shard];
    }
    _instances[shard] = new DB(shard);
    return _instances[shard];
  }
  /**
   * 查询语句
   * @param {String} sql sql语句，可有问号？站位符，为values暂未
   * @param {Array} values sql中？占位符对应的数据
   * @return Promise result|rows
   */
  query(sql, values) {
    return this.queryWithOptions({
      sql: sql,
      values: values
    });
  }
  findOne(tableName, where) {
    const sql = `select * from ${tableName} ${DB.buildConditions(where)}`;
    return this.query(sql);
  }
  queryWithOptions(options) {
    return new Promise((resolve, reject) => {
      try {
        this.conn.query(options, (err, rows, fields) => {
          if (err) {
            // DB.catchError(err);
            // 抛出原始错误
            reject(err);
          } else {
            resolve(rows);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  /**
   * 组建sql的where语句
   * @param {Object} conditions 条件，如{name: 'Tom', age: 20}
   * @return {String} [description]
   */
  static buildConditions(conditions) {
    let where = '';
    let condition = null;

    for (let field in conditions) {
      if (conditions.hasOwnProperty(field)) {
        if (!where) where = ' WHERE ';
        else where += ' AND ';

        condition = conditions[field];
        if (condition === null) {
          where += '`' + field + '` IS NULL';
        } else if (
          typeof condition === 'string' ||
          typeof condition === 'number'
        ) {
          where += '`' + field + '` = ' + this.escape(condition);
        } else if (typeof condition === 'object') {
          var appended = false;
          if (condition.hasOwnProperty('gt')) {
            if (typeof condition.gt !== 'number') {
              // return new DBError(5010, 'sql语句查询比较条件(gt)类型错误: ' + condition.gt + '->' + (typeof condition.gt));
              return new Error('sql语句查询比较条件(gt)类型错误');
            } else {
              where += '`' + field + '` > ' + this.escape(condition.gt);

              appended = true;
            }
          }

          if (condition.hasOwnProperty('gte')) {
            if (typeof condition.gte !== 'number') {
              // return new DBError(5010, 'sql语句查询比较条件(gte)类型错误: ' + condition.gte + '->' + (typeof condition.gte));
              return new Error('sql语句查询比较条件(gt)类型错误');
            } else {
              // 如果前面有条件添加了, 则需要手动添加关键字
              if (appended) {
                where +=
                  ' AND `' + field + '` >= ' + this.escape(condition.gte);
              } else {
                where += '`' + field + '` >= ' + this.escape(condition.gte);
              }

              appended = true;
            }
          }

          if (condition.hasOwnProperty('lt')) {
            if (typeof condition.lt !== 'number') {
              // return new DBError(5010, 'sql语句查询比较条件(lt)类型错误: ' + condition.lt + '->' + (typeof condition.lt))
              return new Error('sql语句查询比较条件(gt)类型错误');
            } else {
              // 如果前面有条件添加了, 则需要手动添加关键字
              if (appended) {
                where += ' AND `' + field + '` < ' + this.escape(condition.lt);
              } else {
                where += '`' + field + '` < ' + this.escape(condition.lt);
              }

              appended = true;
            }
          }

          if (condition.hasOwnProperty('lte')) {
            if (typeof condition.lte !== 'number') {
              // return new DBError(5010, 'sql语句查询比较条件(lte)类型错误: ' + condition.lte + '->' + (typeof condition.lte))
              return new Error('sql语句查询比较条件(gt)类型错误');
            } else {
              // 如果前面有条件添加了, 则需要手动添加关键字
              if (appended) {
                where +=
                  ' AND `' + field + '` <= ' + this.escape(condition.lte);
              } else {
                where += '`' + field + '` <= ' + this.escape(condition.lte);
              }

              appended = true;
            }
          }

          if (condition.hasOwnProperty('not')) {
            // 非空
            if (condition.not === null) {
              // 如果前面有条件添加了, 则需要手动添加关键字
              if (appended) {
                where += ' AND `' + field + '` IS NOT NULL ';
              } else {
                where += '`' + field + '` IS NOT NULL ';
              }

              appended = true;
            } else if (
              typeof condition.not !== 'number' &&
              typeof condition.not !== 'string'
            ) {
              // return new DBError(5010, 'sql语句查询比较条件(not)类型错误: ' + condition.not + '->' + (typeof condition.not))
              return new Error('sql语句查询比较条件(gt)类型错误');
            } else {
              // 如果前面有条件添加了, 则需要手动添加关键字
              if (appended) {
                where +=
                  ' AND `' + field + '` != ' + this.escape(condition.not);
              } else {
                where += '`' + field + '` != ' + this.escape(condition.not);
              }

              appended = true;
            }
          }
        } else {
          // return new DBError(5010, 'sql语句查询条件类型错误: ' + condition + '->' + (typeof condition));
          return new Error(
            'sql语句查询条件类型错误：' + condition + '->' + typeof condition
          );
        }
      }
    }
    // 留出一个空格
    if (where) {
      where = where + ' ';
    }
    return where;
  }
  /**
   * 组建sql的sortby语句
   *
   * @param {Object} sorts 条件，如{created: 1}，1表示降序
   * @return [description]
   */
  static buildOrderby(sorts) {
    let sortby = '';

    for (let field in sorts) {
      if (sorts.hasOwnProperty(field)) {
        if (!sortby) {
          sortby =
            ' ORDER BY `' +
            field +
            '`' +
            (sorts[field] === 0 ? ' ASC ' : ' DESC ');
        } else {
          // 暂时只理会一个sortby
          break;
        }
      }
    }
    // 留出一个空格
    if (sortby) {
      sortby = sortby + ' ';
    }
    return sortby;
  }
  /**
   * 根据条件，查询出固定数量的结果(默认100条记录)
   * @param {String} tbname 表名
   * @param {Object} conditions 例：{name: 'Tom', age: 19}，根据这个条件查询
   * @param {Object} sorts 例：{created: 1}，按照created字段逆序排序
   * @param {Object} limit 例：{offset: 10, count: 10}
   */
  select(tbname, conditions, sorts, limit) {
    const that = this;
    return new Promise((resolve, reject) => {
      limit = isNaN(limit) ? 100 : limit;
      let sql = 'SELECT * FROM `' + tbname + '`';
      let where = DB.buildConditions(conditions);
      if (typeof where !== 'string' && where.message) {
        reject(where);
      }

      let sortby = DB.buildOrderby(sorts);

      sql = sql + where + sortby + ' LIMIT ' + limit;
      that
        .query(sql)
        .then(rows => {
          resolve(rows);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  /**
   * 根据条件，查询出固定数量的结果
   * @param {String} tbname 表名
   * @param {String} field 字段名称，如subject_id，就是根据subject_id这个条件查找
   * @param {Array} valArr 例：[1, 3]，字段值的数组，如语句 where subject_id = 1 or subject_id = 3
   */
  selectOr(tbname, field, valArr) {
    const that = this;
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM `' + tbname + '` WHERE ';
      valArr.forEach((val, i, valArr) => {
        if (i !== valArr.length - 1) {
          sql += field + ' = ' + val + ' or ';
        } else {
          sql += field + ' = ' + val;
        }
      });
      console.log(sql);
      that
        .query(sql)
        .then(rows => {
          resolve(rows);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  /**
   * 根据条件，查询出固定数量的结果
   * @param {String} tbname 表名
   * @param {String} field 字段名称，如subject_id，就是根据subject_id这个条件查找
   * @param {Array} valArr 例：[1, 3]，字段值的数组，如语句 where subject_id = 1 and subject_id = 3
   */
  selectAnd(tbname, field, valArr) {
    const that = this;
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM `' + tbname + '` WHERE ';
      valArr.forEach((val, i, valArr) => {
        if (i !== valArr.length - 1) {
          sql += field + ' = ' + val + ' and ';
        } else {
          sql += field + ' = ' + val;
        }
      });
      that
        .query(sql)
        .then(rows => {
          resolve(rows);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  /**
   * 根据条件，排序选出某一页的数据
   */
  /**
   * 根据条件，排序选出某一页的数据
   * @param  string tbname     [表名]
   * @param  object conditions [例子: {name: 'Tom', age: 19}, 满足条件的查出]
   * @param  object sorts      [例子: {created: 1} 代表按照created字段逆序排列]
   * @param   [description]
   * @param  object limit      [例子: {offset: 10, count: 10} 表示从记录数 10 开始，取出10条记录]
   * @return Promise array<object>
   */
  selectOnePage(tbname, conditions, sorts, page, limit) {
    const that = this;
    return new Promise((resolve, reject) => {
      page = isNaN(page) ? 1 : page;
      limit = isNaN(limit) ? 100 : limit;

      let offset = (page - 1) * limit;

      let sql = 'SELECT * FROM `' + tbname + '`';
      let where = DB.buildConditions(conditions);
      if (typeof where !== 'string' && where.message) {
        reject(where);
      }

      let sortby = DB.buildOrderby(sorts);
      sql = sql + where + sortby + ' LIMIT ' + limit + ' OFFSET ' + offset;

      that
        .query(sql)
        .then(rows => {
          resolve(rows);
        })
        .catch(err => {
          // reject(new DBError(5002, '数据查询错误: ' + err.message, err))
          reject(err);
        });
    });
  }

  /**
   * 查询表中的记录数
   * @param  String  tbname     表名
   * @param  Object  conditions [例子: {name: 'Tom', age: 19}, 满足条件的查出]
   * @return Promise Number     记录的数量
   */
  selectCount(tbname, conditions) {
    const that = this;
    return new Promise((resolve, reject) => {
      let sql = 'SELECT COUNT(*) AS count' + ' FROM `' + tbname + '`';
      let where = DB.buildConditions(conditions);
      if (typeof where !== 'string' && where.message) {
        reject(where);
      }

      sql = sql + where;

      that
        .query(sql)
        .then(count => {
          resolve(count[0].count);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
   * 插入一条数据
   * @param {String} tbname 表名
   * @param {Object} data 插入的数据，如：{ name: 'Tom', age: 19 }
   * @return Promese result 插入的结果，成功则有insertId属性
   */
  insert(tbname, data) {
    const that = this;
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO `' + tbname + '` SET ? ';
      that
        .query(sql, data)
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  /**
   * 删除某个条件下的一条记录
   * @param {String} tbname 表名
   * @param {Object} conditions 条件，例：{name: 'Tom', age: 19}，根据这个条件删除
   * @return null
   */
  delete(tbname, conditions) {
    const that = this;
    return new Promise((resolve, reject) => {
      let sql = 'DELETE FROM `' + tbname + '`';
      let where = DB.buildDelConditions(conditions);

      sql = sql + where;

      // console.log(sql)
      that
        .query(sql)
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  /**
   * 更新记录
   * @param {String} tbname 表名
   * @param {Object} data 要更新的数据，例：{ username: 'xl' }，将字段username的值更新为xl
   * @param {Object} conditions 条件，例：{ id: 1 }，根据这个条件更新某条记录
   */
  update(tbname, data, conditions) {
    const that = this;
    return new Promise((resolve, reject) => {
      let sql = 'UPDATE `' + tbname + '` SET ? ';
      let updateRecord = DB.buildUpdateRecord(conditions);
      sql += updateRecord;

      that
        .query(sql, data)
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  /**
   * 组建更新条件
   * @param {Object} conditions
   */
  static buildUpdateRecord(conditions) {
    let where = ' WHERE ';
    for (let key in conditions) {
      where = where + key + '=' + '"' + conditions[key] + '"';
    }
    return where;
  }
  /**
   * 组建删除的条件
   * @param {Object} conditions 删除条件，如{ id: 2 }
   */
  static buildDelConditions(conditions) {
    let where = ' WHERE ';
    for (let key in conditions) {
      where = where + key + ' = ' + conditions[key];
    }
    return where;
  }
  static escape(sql) {
    return mysql.escape(sql);
  }
}

module.exports = DB;
