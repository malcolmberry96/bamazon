//require mysql and inquire 
var mysql = require('mysql');
var inquirer = require('inquirer');
//connect to db
const connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazon"
})

//test for connection
//connection.connect(function(err) {
   // if (err) throw err;
   // console.log("connected as id " + connection.threadId);
 // });
 
//start of functionality 
function start(){
    connection.query('SELECT * FROM Products', function(err,res){
        if(err) throw err;

        console.log("-----Welcome to bamazon!-----")
        console.log("---------------------------------------")
        console.log("What item would you like to purchase?")
        console.log("--------------------------------------")

        for (var i=0; i<res.length;i++){
            console.log("ID: " + res[i].item_id + "|" + res[i].product_name + "|" + res[i].department_name + "|" + "$" + res[i].price + "|");
            console.log("______________________________________________");
        }

        console.log(' ');
        inquirer.prompt([
            {
            type: "input",
            name: "id",
            message: "What is the ID of the item that you would like to purchase?",
            validate: function(value){
                if(isNaN(value) == false && parseInt(value) <= res.length && parseInt(value) > 0){
                    return true;  
                }else{
                    return false;
                }
            }
        },
            {
                type: "input",
                name: "qty",
                message: "How many of these items would you like to purchase?",
                validate: function(value){
                    if(isNaN(value)){
                       return false; 
                    }else{
                        return true;   
                    }
                }
            }
        ]).then(function(ans){
            let whatToBuy = (ans.id)-1;
            let howMuch = parseInt(ans.qty);
            let grandTotal = parseFloat(((res[whatToBuy].price)*howMuch).toFixed(2));
        
            //check if quantity is sufficient 
            if(res[whatToBuy].stock_quantity >= howMuch){
                //after a purchase, updates quantity in products 
                connection.query("UPDATE products SET ? WHERE ?",[
                    {stock_quantity: (res[whatToBuy].stock_quantity - howMuch)},
                    {item_id: ans.id}
                ], function (err,result){
                    if(err) throw err;
                    console.log("Success! Your total is $" + grandTotal.toFixed(2) + ". Your item(s) will be shipped to you in 2 business days with your Brime account.");
                });
                connection.query("SELECT * FROM Departments", function(err, deptRes){
                    if(err) throw err;
                    var index;
                    for (var i=0; i < deptRes.length; i++){
                        if(deptRes[i].department_name === res[whatToBuy].DepartmentName){
                            index = i;
                        }
                    }
                    //update Total sales in department table
                    connection.query("UPDATE Departments SET ? WHERE ?", [
                        {TotalSales: deptRes[index].TotalSales + grandTotal},
                        {DepartmentName: res[whatToBuy].DepartmentName}
                    ],function(err, deptRes){
                        if(err) throw err;
                    });
                });
                }else{
                    console.log("Sorry, we're out of stock!");
                }
                reprompt();
              
        })
    })
}
//ask if customer would like to purchase another item 
function reprompt(){
    inquirer.prompt([{
        type: "confirm",
        name: "reply",
        message: "Would you like to purchase more items?"
    }]).then(function(ans){
        if(ans.reply){
            start();
        }else{
            console.log("Thank you, see you again!");
        }
    });
}

start();