    fetch('/cartdetails')
        .then(response => response.json())
        .then(data => {
            let cartContainer = document.getElementById("cart-container");
            cartContainer.innerHTML = '';
            if(data.length ===0) {
                let cartItem = document.createElement('div');
                cartItem.className = 'cart-item zero';
                cartItem.innerHTML = `
                <div>there is no item 😮</div>
            `;
            cartContainer.appendChild(cartItem);
        } else { 
            data.forEach(item => {
                let cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                if(item.user_id === parseInt(window.localStorage.getItem("userid"))) {
                    cartItem.innerHTML = `
                    <h3>Book ID : ${item.book_id}</h3>
                    <p>The Quantity: ${item.quantity}</p>
                    <button class="remove-btn" data-cart ="${item.id}">Remove</button>
                `;
                cartContainer.appendChild(cartItem);
                }
              
            })
        }
        });

        
        document.addEventListener('click',function (e) {
            if(e.target.classList.contains("remove-btn")) {
                fetch(`/cartdetails/${parseInt(e.target.getAttribute("data-cart"))}`, { method: 'DELETE' })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        Swal.fire({
                            title: 'Success 🎉',
                            text: 'Removed successfully',
                            icon: 'success',
                            customClass: {
                                popup: 'colored-popup'
                            }
                        }).then( d => location.reload())
                    } else {
                        alert(data.error);
                    }
                });
            }
        })
