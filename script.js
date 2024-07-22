function viewBasket(customerId,storeId){
    var xhr = new XMLHttpRequest();
    var postUrl = 'http://localhost:3000/et/pos/external-basket/v1'; // Proxy server URL
    // var postUrl = 'https://proxyserver-z74x.onrender.com/et/pos/external-basket/v1'; // Proxy server URL
    xhr.open('POST', postUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken); // Include access token in the request headers

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log('POST request successful');

                var response = JSON.parse(xhr.responseText);
                if (response.externalBasketUrl) {
                    console.log(response.externalBasketUrl);

			
  window.location.href = response.externalBasketUrl;

			
                    
                }
            } else {
                console.error('Error:', xhr.status);
                // Handle error if needed
            }
        }
    };

    // Retrieve cart items from localStorage
    var cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // Filter out items with quantity greater than 0
    cartItems = cartItems.filter(item => item.quantity > 0);

    // Re-enumerate itemLineId
    cartItems.forEach((item, index) => {
        item.itemLineId = index + 1; // Increment index by 1
    });

    
    var postData = {
        "externalReference": "SimpleSale",
        "basketType": "RECEIPT",
        "customer": {
            "customerCode": customerId // Change the value dynamically here
        },
        "itemLines": cartItems,
        "store": {
            "storeId": storeId
        }
    };

    // Convert postData to JSON string
    var postDataString = JSON.stringify(postData);
	console.log(postDataString);
    xhr.send(postDataString);
}

function addToCart(itemCodeVar, quantityVar, unitPrice, priceWithDiscount, warehouseIdVar ,finalPrice) {
    const existingItems = localStorage.getItem('cartItems'); 
    const cartItems = existingItems ? JSON.parse(existingItems) : [];
    const existingItemIndex = cartItems.findIndex(item => item.item.itemCode === itemCodeVar);
    if (existingItemIndex !== -1) {
        cartItems[existingItemIndex].quantity++;
    } else {
        const item = {
            "itemCode": itemCodeVar
        };

        const cartItem = {
            "itemLineId": itemLineIdCounter++,
            "item": item,
            "quantity": quantityVar,
            "price": {
                "basePrice": unitPrice,
                "currentPrice": priceWithDiscount
            },
            "lineAmount": {
                "currency": "EUR",
                "value": finalPrice
            },
            "inventoryOrigin": {
                "warehouseId": warehouseIdVar
            }
        };
        
        cartItems.push(cartItem);
    }
    console.log(cartItems);
    
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

let accessToken;
let itemLineIdCounter = 1; // Initialize item line ID counter
let finalItems="";

window.onload = function() {
        localStorage.setItem('cartItems', JSON.stringify([]));
};


document.addEventListener('DOMContentLoaded', async function() {
    try {
        accessToken = await getToken(); // Assign access token retrieved from getToken to the global accessToken variable
        console.log('Access token:', accessToken);
    } catch (error) {
        console.error('Failed to get access token:', error);
    }
});

async function getToken() {
    console.log("hello");
    return new Promise((resolve, reject) => {
        var tokenRequest = new XMLHttpRequest();
        var tokenUrl = 'http://localhost:3000/et/as/connect/token'; // Proxy server URL
        // var tokenUrl = 'https://proxyserver-z74x.onrender.com/et/as/connect/token'; // Proxy server URL
        var tokenData = 'client_id=CegidRetailResourceFlowClient&username=AI@90478305_003_TEST&password=1234&grant_type=password&scope=RetailBackendApi offline_access'; // Construct x-www-form-urlencoded body

        tokenRequest.open('POST', tokenUrl, true);
        tokenRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        tokenRequest.onreadystatechange = function() {
            if (tokenRequest.readyState === 4) {
                if (tokenRequest.status === 200) {
                    var tokenResponse = JSON.parse(tokenRequest.responseText);
                    accessToken = tokenResponse.access_token;
                    resolve(accessToken); // Resolve the promise with the access token
                } else {
                    console.error('Error:', "error with token");
                    reject('Failed to get access token'); // Reject the promise if there's an error
                }
            }
        };

        tokenRequest.send(tokenData);
    });
}

function fetchAndDisplayOrders() {

    const customerIdInput = document.getElementById("input1").value;
const customerNameInput = document.getElementById("input2").value;
const customerLastNameInput = document.getElementById("input3").value;
const emailInput = document.getElementById("input4").value;
const orderNumberInput = parseInt(document.getElementById("input5").value, 10);
const storeIdInput = document.getElementById("input6").value; // Get date input value
const documentDateInput = document.getElementById("input7").value; // Get date input value
const deliveryDateInput = document.getElementById("input8").value;
const searchBarInput = document.getElementById("search").value; // Get search bar input value

  fetch("https://customerorderswempeserver.onrender.com/swagger/AllCustomerActiveOrders")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

        
      // Create table structure
      const orderResultsDiv = document.querySelector(".orderResults");
      const tableHTML = `
        <div class="row">
          <div class="col-lg-12">
            <div class="main-box no-header clearfix">
              <div class="main-box-body clearfix">
                <div class="table-responsive">
                  <table class="table user-list">
                    <thead>
                      <tr>
                        <th>Order Number</th>
                        <th>Document Date</th>
                        <th>Store ID</th>
                        <th>Customer ID</th>
                        <th>Customer Last Name</th>
                        <th>Total Quantity</th>
                        <th>Total Amount</th>
                        <th>Delivery Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody id="customfilteringbody">
                      <!-- Filtered orders will be inserted here -->
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>`;
      orderResultsDiv.innerHTML = tableHTML;

      const tbodyOrders = document.getElementById("customfilteringbody");

      // Clear the current content of tbodyOrders
      tbodyOrders.innerHTML = "";

      // Filter data with AND condition among the six input fields
      const filteredOrders = data.filter((order) => {
        const header = order.header;
	      const searchTerm = searchBarInput.toLowerCase();


 return (
          (!customerIdInput || header.customer.id.toLowerCase().includes(customerIdInput.toLowerCase())) &&
          (!customerNameInput || header.customer.firstName.toLowerCase().includes(customerNameInput.toLowerCase())) &&
          (!customerLastNameInput || header.customer.lastName.toLowerCase().includes(customerLastNameInput.toLowerCase())) &&
	 (!emailInput || header.customer.emails[0].value.toLowerCase().includes(emailInput.toLowerCase())) &&
          (!storeIdInput || header.storeId.toLowerCase().includes(storeIdInput.toLowerCase())) &&
          (!orderNumberInput || header.documentKey.number===orderNumberInput) &&
          (!documentDateInput || new Date(header.documentDate).toISOString().split('T')[0] === documentDateInput) &&
	 (!deliveryDateInput || new Date(header.deliveryDate).toISOString().split('T')[0] === deliveryDateInput)
        );
	      
      });

		
      // Filter data with OR condition for the search bar input
	  const searchTerm = searchBarInput.toLowerCase();
      const searchFilteredOrders = data.filter((order) => {
        const header = order.header;
        
        return (

		header.customer.id.toLowerCase().includes(searchTerm) ||
          header.customer.firstName.toLowerCase().includes(searchTerm) ||
          header.customer.lastName.toLowerCase().includes(searchTerm) ||
          header.storeId.toLowerCase().includes(searchTerm) ||
		header.customer.emails[0].value.toLowerCase().includes(searchTerm)  ||
          header.documentKey.number.toString().includes(searchTerm) ||
          new Date(header.documentDate).toISOString().split('T')[0].includes(searchTerm)||
new Date(header.deliveryDate).toISOString().split('T')[0].includes(searchTerm)
		
          
        );
      });

let finalFilteredOrders;
		if(searchTerm !=""){
      // Combine results with AND condition
       finalFilteredOrders = filteredOrders.filter((order) =>
        searchFilteredOrders.includes(order)
      );}
	  else{
	   finalFilteredOrders =filteredOrders;
	  }

      // Populate table with final filtered orders
      finalFilteredOrders.forEach((order, index) => {
        const header = order.header;
        const lines = order.lines || [];
        if (header) {
          // Calculate total quantity and total amount for the order
          let totalQuantity = 0;
          let totalAmount = 0;
          lines.forEach((line) => {
            const quantity = line.quantities.quantity;
            const unitPrice = line.unitPrice || 0; // Assuming unitPrice is present in the line item
            const discount = line.discounts && line.discounts.length > 0 ? line.discounts[0].amount : 0;
            const total = quantity * (unitPrice - discount);
            totalQuantity += quantity;
            totalAmount += total;
          });

          // Create a new row for the order
          const newRowOrder = document.createElement("tr");
          newRowOrder.setAttribute("id", "order-row-" + header.documentKey.number);
          newRowOrder.innerHTML = `
            <td>${header.documentKey.number}</td>
            <td>${new Date(header.documentDate).toLocaleDateString()}</td>
            <td>${header.storeId || "N/A"}</td>
            <td>${header.customer.id}</td>
            <td>${header.customer.lastName}</td>
            <td>${totalQuantity}</td>
            <td>${totalAmount.toFixed(2)}</td>
            <td>${new Date(header.deliveryDate).toLocaleDateString()}</td>
            <td style="width: 20%;">
              <a href="#" class="table-link text-warning" onclick="showOrder(${index})">
                <span class="fa-stack">
                  <i class="fa fa-square fa-stack-2x"></i>
                  <i class="fa fa-search-plus fa-stack-1x fa-inverse"></i>
                </span>
              </a>
              <a href="#" class="table-link text-info" onclick="editOrder(${index})">
                <span class="fa-stack">
                  <i class="fa fa-square fa-stack-2x"></i>
                  <i class="fa fa-pencil fa-stack-1x fa-inverse"></i>
                </span>
              </a>
              <a href="#" class="table-link danger" onclick="confirmDelete(${header.documentKey.number})">
                <span class="fa-stack">
                  <i class="fa fa-square fa-stack-2x"></i>
                  <i class="fa fa-trash-o fa-stack-1x fa-inverse"></i>
                </span>
              </a>
            </td>
          `;

          // Append the new row to the tbody
          tbodyOrders.appendChild(newRowOrder);
        }
      });
    })
    .catch((error) => console.error("Error fetching data:", error));
}




function clearAndRefresh() {
    // Clear input fields
    document.getElementById("input1").value = "";
    document.getElementById("input2").value = "";
    document.getElementById("input3").value = "";
    document.getElementById("input4").value = "";
    document.getElementById("input5").value = "";
    document.getElementById("input6").value = "";
	document.getElementById("input7").value = "";
document.getElementById("input8").value = "";
    
    fetchAndDisplayOrders();
}

clearAndRefresh();

  fetch("https://customerorderswempeserver.onrender.com/swagger/AllCustomerActiveOrders")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
     window.ordersData = data;
    });

  document.addEventListener("DOMContentLoaded", (event) => {

	   document.getElementById('return').addEventListener('click', (event) => {
    event.preventDefault();
    redirectToUrl();
  });
    const searchInput = document.getElementById("search");
    let debounceTimeout;

	 
    searchInput.addEventListener("input", (event) => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
          
        fetchAndDisplayOrders();
        
       
      }, 500); // 500 milliseconds debounce time
    });
  });

  // Event listener for the search button
 document.getElementById('return').addEventListener('click', redirectToUrl);

 function searchOnClick(event) {
      event.preventDefault();
     fetchAndDisplayOrders();}
     

document.getElementById("searchButton").addEventListener("click", searchOnClick);


  function showBlankPopup() {
    // Store the order data globally for easy access

    // Calculate total amount for the entire order
    let totalAmount = 0;

    const modalHtml = `
              <div class="modal fade" id="orderModal" tabindex="-1" role="dialog" aria-labelledby="orderModalLabel" aria-hidden="true">
                  <div class="modal-dialog modal-lg" role="document">
                      <div class="modal-content">
                          <div class="modal-header">
                              <h5 class="modal-title" id="orderModalLabel">Order Details</h5>
                              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                  <span aria-hidden="true">&times;</span>
                              </button>
                          </div>
                          <div class="modal-body">
                              <div class="container">
                                  <div class="contentbar">
                                      <div class="row">
                                          <div class="col-md-12 col-lg-12 col-xl-12">
                                              <div class="card m-b-30">
                                                  <div class="card-header">
                                                      <h5 class="card-title">Cart</h5>
                                                  </div>
                                                  <div class="card-body">
                                                      <div>
                                                          <div>
                                                              <div class="cart-container">
                                                                  <div class="cart-head">
                                                                      <div class="table-responsive">
                                                                          <table class="table table-borderless">
                                                                              <thead>
                                                                                  <tr>
                                                                                      <th scope="col">No Reference</th>
                                                                                      <th scope="col">Description</th>
                                                                                      <th scope="col">Quantity</th>
                                                                                      <th scope="col">Price Discount</th>
                                                                                      <th scope="col">Amount</th>
                                                                                      <th scope="col">Delivery Date</th>
                                                                                      <th scope="col" class="text-right">Total</th>
                                                                                  </tr>
                                                                              </thead>

                                                                          </tbody>
                                                                      </table>
                                                                  </div>
                                                              </div>
                                                              <div class="cart-body">

                                                              <div class="new-line">
                                                              <button class="btn btn-primary">New Line</button>
                                                              </div>

                                                              <h4>Tax Inc. Total Amount:</h4>
                                                              <h3>€${totalAmount}</h4>
                                                              </div>
                                                              <div class="cart-footer text-right">

                                                                  <a href="page-checkout.html" class="btn btn-primary my-1">Create Order<i class="ri-arrow-right-line ml-2"></i></a>
                                                              </div>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          `;

    // Remove existing modal if present
    const existingModal = document.getElementById("orderModal");
    if (existingModal) {
      existingModal.parentNode.removeChild(existingModal);
    }

    // Append new modal to body
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Show the modal
    $("#orderModal").modal("show");
  }

  function showEditablePopup(orderIndex) {
     fetch("https://customerorderswempeserver.onrender.com/swagger/AllCustomerActiveOrders")
      .then((response) => response.json())
      .then((data) => {
        const order = data[orderIndex];
       console.log(order);

        // Store the order data globally for easy access
        window.ordersData = data;

        // Calculate total amount for the entire order
        let totalAmount = calculateTotalAmount(order.lines);

        const modalHtml = `
              <div class="modal fade" id="orderModal" tabindex="-1" role="dialog" aria-labelledby="orderModalLabel" aria-hidden="true">
                  <div class="modal-dialog modal-lg" role="document">
                      <div class="modal-content">
                          <div class="modal-header">
                              <h5 class="modal-title" id="orderModalLabel">Order Details</h5>
                              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                  <span aria-hidden="true">&times;</span>
                              </button>
                          </div>
                          <div class="modal-body">
                              <div class="container">
                                  <div class="contentbar">
                                      <div class="row">
                                          <div class="col-md-12 col-lg-12 col-xl-12">
                                              <div class="card m-b-30">
                                                  <div class="card-header">
                                                      <h5 class="card-title">Cart</h5>
                                                  </div>
                                                  <div class="card-body">
                                                      <div>
                                                          <div>
                                                              <div class="cart-container">
                                                                  <div class="cart-head">
                                                                      <div class="table-responsive">
                                                                          <table class="table table-borderless">
                                                                              <thead>
                                                                                  <tr>
                                                                                      <th scope="col">No Reference</th>
                                                                                      <th scope="col">Description</th>
                                                                                      <th scope="col">Quantity</th>
                                                                                      <th scope="col">Price Discount</th>
                                                                                      <th scope="col">Amount</th>
                                                                                      <th scope="col">Delivery Date</th>
                                                                                      <th scope="col" class="text-right">Total</th>
                                                                                  </tr>
                                                                              </thead>
                                                                              <tbody id="order-lines-tbody">
                                                                              ${order.lines
                                                                                .map(
                                                                                  (
                                                                                    line,
                                                                                    index
                                                                                  ) => {
                                                                                    const quantity =
                                                                                      line
                                                                                        .quantities
                                                                                        .quantity;
                                                                                    const unitPrice =
                                                                                      line.unitPrice?line.unitPrice : 0;
                                                                                    const discount =
                                                                                      line.discounts &&
                                                                                      line
                                                                                        .discounts
                                                                                        .length >
                                                                                        0
                                                                                        ? line
                                                                                            .discounts[0]
                                                                                            .amount
                                                                                        : 0;
                                                                                    const total =
                                                                                      quantity *
                                                                                        (unitPrice -
                                                                                      discount);
                                                                                    return `
                                                                                      <tr id="line-row-${
                                                                                        index +
                                                                                        1
                                                                                      }">
                                                                                          <td>${
                                                                                            index +
                                                                                            1
                                                                                          }</td>
                                                                                          <td>${
                                                                                            line.description
                                                                                          }</td>
                                                                                          <td>${quantity}</td>
                                                                                          <td>€${discount}</td>
                                                                                          <td>€${unitPrice}</td>
                                                                                          <td>${new Date(
                                                                                            line.deliveryDate
                                                                                          ).toLocaleDateString()}</td>
                                                                                          <td class="text-right">€${total.toFixed(
                                                                                            2
                                                                                          )}</td>
                                                                                          <td>
                                                                                              <a href="#" class="table-link danger" onclick="confirmDeleteLine(${orderIndex}, ${
                                                                                      index +
                                                                                      1
                                                                                    })">
                                                                                                  <span class="fa-stack">
                                                                                                      <i class="fa fa-square fa-stack-2x"></i>
                                                                                                      <i class="fa fa-trash-o fa-stack-1x fa-inverse"></i>
                                                                                                  </span>
                                                                                              </a>
                                                                                          </td>
                                                                                      </tr>
                                                                                  `;
                                                                                  }
                                                                                )
                                                                                .join(
                                                                                  ""
                                                                                )}
                                                                          </tbody>
                                                                      </table>
                                                                  </div>
                                                              </div>
                                                              <div class="cart-body">

                                                              <div class="new-line">
                                                              <button class="btn btn-primary">New Line</button>
                                                              </div>

                                                              <h4>Tax Inc. Total Amount:</h4>
                                                              <h3>€${totalAmount}</h4>
                                                              </div>
                                                              <div class="cart-footer text-right">
                                                                  <button type="button" class="btn btn-success my-1"><i class="ri-save-line mr-2"></i>Update Cart</button>
                                                                   <button type="button" class="btn btn-primary my-1" id="proceed-to-checkout">Proceed to Checkout<i class="ri-arrow-right-line ml-2"></i></button>
                                                              </div>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          `;

        // Remove existing modal if present
        const existingModal = document.getElementById("orderModal");
        if (existingModal) {
          existingModal.parentNode.removeChild(existingModal);
        }

        // Append new modal to body
        document.body.insertAdjacentHTML("beforeend", modalHtml);

        // Show the modal
        $("#orderModal").modal("show");
			document.getElementById('proceed-to-checkout').addEventListener('click', () => {
				
				order.lines.forEach(line => {
					
					const itemCodeVar = line.item.id;
					const quantityVar = line.quantities.quantity;
					const unitPrice = line.unitPrice;
					const discount = line.discounts && line.discounts.length > 0 ? line.discounts[0].amount : 0;
					const priceWithDiscount = unitPrice - discount;
					const warehouseIdVar = line.warehouseId;
					const finalPrice = quantityVar*(unitPrice - discount);
					
					addToCart(itemCodeVar, quantityVar, unitPrice, priceWithDiscount, warehouseIdVar,finalPrice);
				});

				const customerId=order.header.customer.id;
				const storeId=order.header.storeId;
				viewBasket(customerId,storeId);
					
				// document.getElementById('viewBasketAll').addEventListener('click', function() {

			});
	      
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  function showPopup(orderIndex, text) {
   fetch("https://customerorderswempeserver.onrender.com/swagger/AllCustomerActiveOrders")
      .then((response) => response.json())
      .then((data) => {
        const order = data[orderIndex];

        // Store the order data globally for easy access
        window.ordersData = data;

        // Calculate total amount for the entire order
        let totalAmount = calculateTotalAmount(order.lines);

        const modalHtml = `
              <div class="modal fade" id="orderModal" tabindex="-1" role="dialog" aria-labelledby="orderModalLabel" aria-hidden="true">
                  <div class="modal-dialog modal-lg" role="document">
                      <div class="modal-content">
                          <div class="modal-header">
                              <h5 class="modal-title" id="orderModalLabel">Order Details</h5>
                              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                  <span aria-hidden="true">&times;</span>
                              </button>
                          </div>
                          <div class="modal-body">
                              <div class="container">
                                  <div class="contentbar">
                                      <div class="row">
                                          <div class="col-md-12 col-lg-12 col-xl-12">
                                              <div class="card m-b-30">
                                                  <div class="card-header">
                                                      <h5 class="card-title">Cart</h5>
                                                  </div>
                                                  <div class="card-body">
                                                      <div>
                                                          <div>
                                                              <div class="cart-container">
                                                                  <div class="cart-head">
                                                                      <div class="table-responsive">
                                                                          <table class="table table-borderless">
                                                                              <thead>
                                                                                  <tr>
                                                                                      <th scope="col">No Reference</th>
                                                                                      <th scope="col">Description</th>
                                                                                      <th scope="col">Quantity</th>
                                                                                      <th scope="col">Price Discount</th>
                                                                                      <th scope="col">Amount</th>
                                                                                      <th scope="col">Delivery Date</th>
                                                                                      <th scope="col" class="text-right">Total</th>
                                                                                  </tr>
                                                                              </thead>
                                                                              <tbody id="order-lines-tbody">
                                                                              ${order.lines
                                                                                .map(
                                                                                  (
                                                                                    line,
                                                                                    index
                                                                                  ) => {
                                                                                    const quantity =
                                                                                      line
                                                                                        .quantities
                                                                                        .quantity;
                                                                                    const unitPrice =
                                                                                      line.unitPrice? line.unitPrice:0;
                                                                                    const discount =
                                                                                      line.discounts &&
                                                                                      line
                                                                                        .discounts
                                                                                        .length >
                                                                                        0
                                                                                        ? line
                                                                                            .discounts[0]
                                                                                            .amount
                                                                                        : 0;
                                                                                    const total =
                                                                                      quantity *
                                                                                        (unitPrice -
                                                                                      discount);
                                                                                    return `
                                                                                      <tr id="line-row-${
                                                                                        index +
                                                                                        1
                                                                                      }">
                                                                                          <td>${
                                                                                            index +
                                                                                            1
                                                                                          }</td>
                                                                                          <td>${
                                                                                            line.description
                                                                                          }</td>
                                                                                          <td>${quantity}</td>
                                                                                          <td>€${discount}</td>
                                                                                          <td>€${unitPrice.toFixed(
                                                                                            2
                                                                                          )}</td>
                                                                                          <td>${new Date(
                                                                                            line.deliveryDate
                                                                                          ).toLocaleDateString()}</td>
                                                                                          <td class="text-right">€${total.toFixed(
                                                                                            2
                                                                                          )}</td>

                                                                                      </tr>
                                                                                  `;
                                                                                  }
                                                                                )
                                                                                .join(
                                                                                  ""
                                                                                )}
                                                                          </tbody>
                                                                      </table>
                                                                  </div>
                                                              </div>
                                                              <div class="cart-body">
                                                              <div class="new-line">

                                                              </div>
                                                              <h4>Tax Inc. Total Amount:</h4>
                                                              <h3>€${totalAmount}</h4>
                                                              </div>
                                                              <div class="cart-footer text-right">

                                                                  <button type="button" class="btn btn-primary my-1" id="proceed-to-checkout">Proceed to Checkout<i class="ri-arrow-right-line ml-2"></i></button>
                                                              </div>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          `;

        // Remove existing modal if present
        const existingModal = document.getElementById("orderModal");
        if (existingModal) {
          existingModal.parentNode.removeChild(existingModal);
        }

        // Append new modal to body
        document.body.insertAdjacentHTML("beforeend", modalHtml);

        // Show the modal
        $("#orderModal").modal("show");

	      			document.getElementById('proceed-to-checkout').addEventListener('click', () => {
				
				order.lines.forEach(line => {
					
					const itemCodeVar = line.item.id;
					const quantityVar = line.quantities.quantity;
					const unitPrice = line.unitPrice;
					const discount = line.discounts && line.discounts.length > 0 ? line.discounts[0].amount : 0;
					const priceWithDiscount = unitPrice - discount;
					const warehouseIdVar = line.warehouseId;
					const finalPrice = quantityVar*(unitPrice - discount);
					
					addToCart(itemCodeVar, quantityVar, unitPrice, priceWithDiscount, warehouseIdVar,finalPrice);
				});

				const customerId=order.header.customer.id;
				const storeId=order.header.storeId;
				viewBasket(customerId,storeId);
					
				// document.getElementById('viewBasketAll').addEventListener('click', function() {

			});
	      
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  function closePopup() {
    document.getElementById("popupContainer").style.display = "none";
  }

  // Placeholder functions for edit and delete
  function editOrder(index) {
    showEditablePopup(index);
  }

  function showOrder(index) {
    showPopup(index);
  }

  function confirmDelete(orderNumber) {
    const confirmation = confirm(
      "Are you sure you want to delete this record?"
    );
    if (confirmation) {
      const ordersData = window.ordersData;
      const orderIndex = ordersData.findIndex(
        (orderLine) => orderLine.header.documentKey.number === orderNumber
      );

      // If the order line is found, remove it
      if (orderIndex !== -1) {
        ordersData.splice(orderIndex, 1);

        // Also remove the corresponding row from the DOM
        const orderRow = document.querySelector(
          `#order-row-${orderNumber}`
        );
        if (orderRow) {
          orderRow.remove();
        }
      }
    }
  }
  function confirmDeleteLine(orderIndex, lineNumber) {
    // Find the line index based on the lineNumber
    const confirmation = confirm(
      "Are you sure you want to delete this record?"
    );
    if (confirmation) {
      const order = window.ordersData[orderIndex];
      const lineIndex = lineNumber - 1; // Adjust for 0-based indexing

      if (lineIndex >= 0 && lineIndex < order.lines.length) {
        // Remove the line from the data
        order.lines[lineIndex].unitPrice = 0;

        if (
          order.lines[lineIndex].discounts &&
          order.lines[lineIndex].discounts.length > 0
        ) {
          order.lines[lineIndex].discounts[0].amount = 0;
        }

        // Remove the line from the DOM
        const lineRow = document.querySelector(`#line-row-${lineNumber}`);
        if (lineRow) {
          lineRow.remove();
        }

        // Recalculate the total amount
        const totalAmount = (order.lines);

        // Update the total amount in the modal
        document.querySelector(
          "#orderModal .cart-body h3"
        ).textContent = `€${totalAmount}`;
      } else {
        console.error(`Line with No Reference ${lineNumber} not found.`);
      }
    }
  }

  function confirmDeleteLine(orderIndex, lineNumber) {
    const confirmation = confirm(
      "Are you sure you want to delete this record?"
    );
    if (confirmation) {
      const order = window.ordersData[orderIndex];

      // Find the line index based on the lineNumber
      const lineIndex = lineNumber - 1; // Adjust for 0-based indexing

      if (lineIndex >= 0 && lineIndex < order.lines.length) {
        // Remove the line from the data
        order.lines[lineIndex].unitPrice = 0;

        if (
          order.lines[lineIndex].discounts &&
          order.lines[lineIndex].discounts.length > 0
        ) {
          order.lines[lineIndex].discounts[0].amount = 0;
        }

        // Remove the line from the DOM
        const lineRow = document.querySelector(`#line-row-${lineNumber}`);
        if (lineRow) {
          lineRow.remove();
        }

        // Recalculate the total amount
        const totalAmount = calculateTotalAmount(order.lines);

        // Update the total amount in the modal
        document.querySelector(
          "#orderModal .cart-body h3"
        ).textContent = `€${totalAmount}`;
      } else {
        console.error(`Line with No Reference ${lineNumber} not found.`);
      }
    }
  }

  function calculateTotalAmount(lines) {
    let totalAmount = 0;
    lines.forEach((line) => {
      const quantity = line.quantities.quantity;
      const unitPrice = line.unitPrice ? line.unitPrice:5 ;
      const discount =
        line.discounts && line.discounts.length > 0
          ? line.discounts[0].amount
          : 0;
      const total = quantity *( unitPrice - discount);
      totalAmount += total;
    });
    return totalAmount.toFixed(2);
  }

  function deleteLine(orderIndex, lineIndex) {
    const order = window.ordersData[orderIndex];
    order.lines.splice(lineIndex, 1); // Remove the line from the data

    document.querySelector(`#line-row-${lineIndex}`).remove(); // Remove the line from the DOM

    // Recalculate the total amount
    const totalAmount = calculateTotalAmount(order.lines);

    // Update the total amount in the modal
    document.querySelector(
      "#orderModal .cart-body h3"
    ).textContent = `€${totalAmount}`;
  }
  
  function redirectToUrl() {
  window.location.href = "https://retail-services.cegid.cloud/et/pos/";
}

  function deleteOrder(orderIndex) {
    // Your logic to delete the order from the server or local data

    document.querySelector(`#order-row-${orderIndex}`).remove();
  }

  // Call the function to fetch and display orders
