document.addEventListener('DOMContentLoaded', function() {
    fetch('/get_order_detail')
        .then(response => response.json())
        .then(data => {
            const orderDetailsContainer = document.getElementById('order-details');
            let currentOrderId = null;
            let orderGroup = null;
            fetch('/getorder')
            .then(repo => repo.json())
            .then(datarepo => {
                for (let i = 0; i < datarepo.length; i++) {
                    if(datarepo[i].user_id === parseInt(window.localStorage.getItem("userid"))) {
                        data.forEach(order => {
                            if(datarepo[i].id === order.order_id) {
                            if (order.order_id !== currentOrderId) {
                                currentOrderId = order.order_id;
                                orderGroup = document.createElement('div');
                                orderGroup.className = 'order';
                                orderGroup.innerHTML = `<div class="order-id">Order ID: ${currentOrderId}</div>`;
                                orderDetailsContainer.appendChild(orderGroup);
                            }
                            const orderDetail = document.createElement('div');
                            orderDetail.className = 'order-detail';
                            orderDetail.innerHTML = `<i class="fas fa-check-circle"></i> Book ID: ${order.book_id}, Quantity: ${order.quantity} , Price of one ${order.price}`;
                            orderGroup.appendChild(orderDetail);
                        }
                    });
                    }
                }
                let tPrice = document
            })            
        })
        .catch(error => console.error('Error fetching order details:', error));
});
