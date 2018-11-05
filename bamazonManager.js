//require mysql and iquirer 
var mysql = require('mysql');
var inquirer = require('inquirer');
//Connection to db
var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazon"
})
//test connection
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
  });

function start(){
    inquirer.prompt([{
        type: "list",
        name: "doThing",
        message: "What would you like to do?",
        choices: ["View Product for Sale", "View Low Inventory", "Add to inventory","Add New Product","End Session"]
    }]).then(function(ans){
        switch(ans.doThing){
            case "View Products for Sale": viewProducts ();
            break;
            case "View Low Inventory": viewLowInventory ();
            break;
            case "Add to Inventory": addToInventory ();
            break;
            case "End Session":console.log('Goodbye');
        }
    });
}
//view inventory
function viewProducts(){
    console.log('------------------Products---------------------------------------')

    connection.query('SELECT * FROM products', function(err,res){
        if(err) throw err;
        console.log('--------------------------------------------------------------')

        for (var i=0; i<res.length;i++){
            console.log("ID: " + res[i].item_id + "|" + res[i].product_name + "|" + res[i].department_name + "|" + "$" + res[i].price + "|" + res[i].stock_quantity);
            console.log("______________________________________________");
        }

    start();
    });
}

//low inventory view 
function viewLowInventory(){
    console.log("------------------Low Inventory---------------------------------------")

    connection.query('SELECT * FROM products', function(err,res){
        if(err) throw err;
        console.log('--------------------------------------------------------------')

        for (var i=0; i<res.length;i++){
            if(res[i].stock_quantity<=5){
            console.log("ID: " + res[i].item_id + "|" + res[i].product_name + "|" + res[i].department_name + "|" + "$" + res[i].price + "|" + res[i].stock_quantity);
            console.log("______________________________________________");
        }
    }


    start();
});
}
//adding more items to the inventory 
function addToInventory(){
    console.log("------------------Low Inventory---------------------------------------");

    connection.query('SELECT * FROM products', function(err, res){
        if(err) throw err;
        var itemArray = [];
        //push items back into the array
        for(var i=0; i<res.length; i++){
            itemArray.push(res[i].product_name);
        }
        inquirer.prompt([{
            type:"list",
            name: "product",
            choices: itemArray,
            message: "What item would you like to add to the inventory?"
        },{
            type: "input",
            name: "qty",
            message: "How many items would you like to stock?",
            validate: function(value){
                if(isNaN(value) === false){return true;}
                else{return false;}
            }
        }]).then(function(ans){
        var currentQty;
        for(var i=0; i<res.length; i++){
            if(res[i].product_name === ans.product){
                currentQty = res[i].stock_quantity;
            }
        }
        connection.query('UPDATE products SET ? WHERE ?', [
            {stock_quantity: currentQty + parseInt(ans.qty)},
            {product_name: ans.product}
        ], function(err,res){
            if(err) throw err;
            console.log('The stock has been updated.');
            start();
        });
    });
});
}
//functionality to add entire new product to bamazon
function addNewProduct(){
    console.log("------------------Low Inventory---------------------------------------");
    var deptNames = [];

//grab name of departments
connection.query('SELECT * FROM Departments', function(err, res){
    if(err) throw err;
    for(var i = 0; i<res.length; i++){
      deptNames.push(res[i].DepartmentName);
    }
  })

  inquirer.prompt([{
    type: "input",
    name: "product",
    message: "Product: ",
    validate: function(value){
      if(value){return true;}
      else{return false;}
    }
  }, {
    type: "list",
    name: "department",
    message: "Department: ",
    choices: deptNames
  }, {
    type: "input",
    name: "price",
    message: "Price: ",
    validate: function(value){
      if(isNaN(value) === false){return true;}
      else{return false;}
    }
  }, {
    type: "input",
    name: "quantity",
    message: "Quantity: ",
    validate: function(value){
      if(isNaN(value) == false){return true;}
      else{return false;}
    }
  }]).then(function(ans){
    connection.query('INSERT INTO products SET ?',{
      product_name: ans.product,
      department_name: ans.department,
      Price: ans.price,
      stock_quantity: ans.quantity
    }, function(err, res){
      if(err) throw err;
      console.log('The item was successfully added to the store.');
    })
    start();
  });
}

start();