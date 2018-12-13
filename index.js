const sqlMetods = require ('./sql_metods');
const input_fn = require ('./input_fn');
const readline = require ('readline');

const rl = readline.createInterface ({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});


async function request () {
    rl.question ("Введи команду (список команд help): ", async (answer) => {
        switch (answer) {
            case "help":
                console.log("Список команд:\n" +
                    "allst - вывести список всех сотрудников\n" +
                    "alldiv - вывести список всех подразделений\n" +
                    "addiv - добавить подразделение\n" +
                    "addst - добавить сотрудника\n" +
                    "editdiv - редактировать подразделение\n" +
                    "editst - редактировать сотрудника\n" +
                    "deldiv - удалить подразделение\n" +
                    "delst - удалить сотрудника\n" +
                    "exit - выход\n");
                    request();
                    return;
            case "allst": {
                let result = await sqlMetods.staff_bd (`
                SELECT staff.id, staff.last_name, staff.first_name, staff.middle_name, divisions.div_name 
                FROM staff 
                LEFT JOIN divisions 
                ON staff.division_id = divisions.id`);
                console.table(result);
                request();
                return;
            }
            case "alldiv": {
                let result = await sqlMetods.staff_bd (`
                SELECT divisions.id, divisions.div_name 
                FROM divisions`);
                console.table(result);
                request();
                return;
            }
            case "addiv": {
                let answer = await (input_fn.inpdiv());
                let result = await sqlMetods.staff_bd(`
                INSERT INTO divisions (div_name)
                VALUES ('${answer}')`);
                console.log("Подразделение добавлено!");
                request();
                return;
            }
            case "adst": {
                let [last_name, first_name, middle_name, division_id] = await (input_fn.inpst());
                console.log(answer);
                await sqlMetods.staff_bd(`
                INSERT INTO staff (last_name, first_name, middle_name, division_id)
                VALUES ('${last_name}', '${first_name}', '${middle_name}', '${division_id}')`);
                console.log("Сотрудник добавлен!");
                request();
                return;
            }
            case "editdiv": {
                await input_fn.get_div().then(async (division_id) => {
                    await input_fn.edit_div().then(async (new_div_name) => {
                        await sqlMetods.staff_bd(`
                        UPDATE divisions SET div_name = '${new_div_name}'
                        WHERE id = '${division_id}'`);
                        console.log("Название подразделения изменено!");
                        request();
                    }).catch(() => {
                        request();
                    })
                }).catch(() => {
                    request();
                });

                return;
            }
            case "editst": {
                await input_fn.get_staff().then(async (staff_id) => {
                    await input_fn.edit_st().then(async (change_params) => {
                        await sqlMetods.staff_bd(`UPDATE staff SET ${
                            Object.keys(change_params).map((column_name) => {
                                return `${column_name}="${change_params[column_name]}"`
                            }).join(', ')
                            } WHERE id = ${staff_id}`);
                        console.log("Данные сотрудника изменены!");
                        request();
                    }).catch(res => {
                        request();
                    });
                }).catch( () => {
                    request();
                })
                return;
            }
            case "deldiv": {
                await input_fn.get_div().then(async (division_id) => {
                    await input_fn.del_div(division_id).then(async () => {
                        await sqlMetods.staff_bd(`
                        DELETE
                        FROM divisions
                        WHERE divisions.id = ${division_id}`);
                        console.log("Подразделение удалено!");
                        request();
                    }).catch(() => {
                        request();
                    });
                }).catch(() => {
                    request();
                });

                return;
            }
            case "delst": {
                await input_fn.get_staff().then(async (staff_id) => {
                    await input_fn.del_st().then(async () => {
                        let result = await sqlMetods.staff_bd(`
                    DELETE
                    FROM staff
                    WHERE staff.id = ${staff_id}`);
                        console.log("Сотрудник удален!");
                        request();
                    }).catch(() => {
                        request();
                    })
                }).catch(() => {
                    request();
                });
                return;
            }
            case "exit":
                rl.close ();
                process.exit ();
                break;
            default:
                console.log("Неизвестная команда");
                request();
                return;
        }
    })
}
request();

module.exports = request;
