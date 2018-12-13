const readline = require ('readline');
const sqlMetods = require ('./sql_metods');

const rl = readline.createInterface ({
    input: process.stdin,
    output: process.stdout
});

module.exports = {
   inpdiv: function () {
        return new Promise((resolve, reject) => {
            rl.question ("Название подразделения: ", async (answer) => {
                if (answer.toString().trim() === "") {
                    console.log("Название не может быть пустым!");
                    resolve (await this.inpdiv());
                    return;
                }
                let div_exist = await sqlMetods.staff_bd(`
                SELECT divisions.div_name
                FROM divisions
                WHERE divisions.div_name = '${answer}'`);
                if (div_exist.length == 0) {
                    resolve(answer);
                    return;
                }
                else {
                    console.log("Такое подразделение уже существует!");
                    resolve (await this.inpdiv());
                }
            })
        })
    },


    inpst: function (selectQuestion, result) {
        return new Promise((resolve, reject) => {
            if(!selectQuestion) {
                selectQuestion = 1;
                console.log("Добавление нового сотрудника. \n");
            }
            switch (selectQuestion) {
                case 1:
                    rl.question ("Фамилия: ", async (answer) => {
                        if (answer.toString().trim() === "") {
                            console.log("Поле не может быть пустым!");
                            resolve(await this.inpst(1));
                            return;
                        }
                        resolve(await this.inpst(2, {last_name: answer}));
                    });
                    break;
                case 2:
                    rl.question ("Имя: ", async (answer2) => {
                        if (answer2.toString().trim() === "") {
                            console.log("Поле не может быть пустым!");
                            resolve(await this.inpst(2, {last_name: result.last_name}));
                            return;
                        }
                        resolve(await this.inpst(3, {last_name: result.last_name, first_name: answer2}));
                    });
                    break
                case 3:
                    rl.question ("Отчество: ", async (answer3) => {
                        let get_div = await this.get_div();
                        resolve ([result.last_name, result.first_name, answer3, get_div]);
                    });
                    break
            }

        })
   },
   edit_st: function (get_change_staff_obj) {
       return new Promise((resolve,reject) => {
           rl.question (
               "\n1 - изменить фамилию; \n" +
               "2 - изменить имя; \n" +
               "3 - изменить отчетсво; \n" +
               "4 - изменить подразделение; \n" +
               "5 - Вернуться к предыдущему пункту меню;\n" +
               "6 - Сохранить внесенные изменения\n" +
               "Выберите параметр для изменения: ", async (change_staff_param) => {
                   if (change_staff_param.toString().trim() === "") {
                       console.log("Поле не может быть пустым!");
                       return;
                   }
                   let change_staff_obj = get_change_staff_obj || {};
                   switch (change_staff_param) {
                       case "1": {
                           rl.question("Введите фамилию:", async (changeLastName) => {
                               if (changeLastName.toString().trim() === "") {
                                   console.log("Поле не может быть пустым!");
                                   return;
                               }
                               change_staff_obj.last_name = changeLastName;
                               console.log(`Фамилия будет изменена на: ${changeLastName} \n`);
                               resolve(await this.edit_st(change_staff_obj));
                           })
                           break;
                       }
                       case "2": {
                           rl.question("Введите имя:", async (changeFirstName) => {
                               if (changeFirstName.toString().trim() === "") {
                                   console.log("Поле не может быть пустым!");
                                   return;
                               }
                               change_staff_obj.first_name = changeFirstName;
                               console.log(`Имя будет изменено на: ${changeFirstName} \n`);
                               resolve(await this.edit_st(change_staff_obj));
                           })
                           break;
                       }
                       case "3": {
                           rl.question("Введите отчество:",async (changeMiddleName) => {
                               if (changeMiddleName.toString().trim() === "") {
                                   console.log("Поле не может быть пустым!");
                                   return;
                               }
                               change_staff_obj.middle_name = changeMiddleName;
                               console.log(`Отчество будет изменено на: ${changeMiddleName} \n`);
                               resolve(await this.edit_st(change_staff_obj));
                           })
                           break;

                       }
                       case "4": {
                           rl.question("Введите номер подразделения:", async (changeDivision) => {
                               if (changeDivision.toString().trim() === "") {
                                   console.log("Поле не может быть пустым!");
                                   return;
                               }
                               change_staff_obj.division_id = changeDivision;
                               console.log(`Подразделение будет изменено на: ${changeDivision} \n`);
                               resolve(await this.edit_st(change_staff_obj));
                               return;
                           })
                           break;
                       }
                       case "5": {
                           reject();
                           break;
                       }
                       case "6": {
                           resolve (change_staff_obj);
                           break;
                       }
                       default:
                           console.log("Неизвестная команда");
                           resolve(await this.edit_st(change_staff_obj));
                   }
               })
       })
   },
    get_staff: function () {
        return new Promise((resolve, reject) => {
            rl.question("Введите id сотрудника:", async (id) => {
                if (id.toString().trim() == "") {
                    console.log("Поле не может быть пустым");
                    resolve (await this.get_staff());
                    return;
                }
                let count_st = await sqlMetods.staff_bd(`
                SELECT staff.id
                FROM staff`);
                if (count_st.length == 0) {
                    console.log("Нет добавленных сотрудников");
                    reject();
                }
                let exist_staff = await sqlMetods.staff_bd(`
                SELECT staff.last_name, staff.first_name, staff.middle_name, staff.division_id 
                FROM staff 
                WHERE staff.id = ${id}`);
                if (exist_staff.length != 0) {
                    console.table(exist_staff);
                    resolve(id);
                }
                else {
                    console.log("Cотрудник не найден");
                    resolve (await this.get_staff());
                };
            })

        })
    },
    edit_div: function () {
        return new Promise((resolve, reject) => {
            rl.question("Введите новое название подразделения: ", async (new_div_name) => {
                if (new_div_name.toString().trim() === "") {
                    console.log("Вы ничего не ввели");
                    resolve (await this.edit_div());
                    return
                }
                else rl.question("Сохранить введенное название? 1 - да; 2 - нет:", async (answer2) => {
                    if (answer2 == "2") {
                        reject(); // возврат в главное меню
                    }
                    else resolve(new_div_name);
                });
            });
        });
    },
    get_div: function () {
        return new Promise((resolve,reject) => {
            rl.question("Введите id подразделения:", async (division_id) => {
                if (division_id.toString().trim() === "") {
                    console.log("Поле не может быть пустым!");
                    resolve (await this.get_div());
                    return;
                }
                let div_not_empty = await sqlMetods.staff_bd(`
                SELECT divisions.div_name 
                FROM divisions`);
                if (div_not_empty.length == 0) {
                    console.log("Нет добавленных подразделений");
                    reject();
                    return;
                }
                let exist_div = await sqlMetods.staff_bd(`
                SELECT divisions.div_name 
                FROM divisions
                WHERE divisions.id = ${division_id}`);
                if (exist_div.length != 0) {
                    console.table(exist_div);
                    resolve (division_id);
                }
                else {
                    console.log("Подразделение не найдено!");
                    resolve (await this.get_div());
                }
            })
        })
    },
    del_div: function (div_id) {
        return new Promise((resolve, reject) => {
            rl.question("Вы действительно хотите удалить выбранное подразделение? 1 - да; 2 - нет:", async (answer) => {
                switch (answer) {
                    case "1": {
                        let div_in_staff = await sqlMetods.staff_bd(`
                        SELECT (staff.division_id)
                        FROM staff
                        WHERE staff.division_id = ${div_id}`);
                        let count_staff = div_in_staff.length;
                        if (count_staff == 0) {
                            resolve ();
                            return;
                        }
                        else {
                            console.log(`Нельзя удалить! Подразделение привязано к ${count_staff} сотрудникам\n`);
                            reject();
                        }
                        break;
                    }
                    case "2": {
                        reject();
                        break;
                    }
                    default:
                        console.log("Неизвестная команда");
                        resolve (await this.del_div());
                }

            })
        })
    },
    del_st: function () {
        return new Promise((resolve, reject) => {
            rl.question("Вы действительно хотите удалить выбранного сотрудника? 1 - да; 2 - нет:", async (answer) => {
                switch (answer) {
                    case "1":
                        resolve();
                        break;
                    case "2":
                        reject();
                        break;
                    default:
                        console.log("Неизвестная команда");
                        resolve(await this.del_st());
                }
            })
        })
    }
}
