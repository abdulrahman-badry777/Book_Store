async function cartdetails() {
    let str = [];
    const response = await fetch('/cartdetails');
    const data = await response.json();
    
    // Process cart details
    for (const d of data) {
        const bookResponse = await fetch(`/book_details/${d.book_id}`);
        const bookData = await bookResponse.json();
        let obj = {
            price: bookData.price,
            qu: d.quantity
        };
        str.push(obj);
    }

    // Calculate total price after fetching all details
    let tPrice = await calculateTotalPrice(str);
    return tPrice;
}

async function calculateTotalPrice(arrs) {
    let tPrice = 0;

    for (const d of arrs) {
        tPrice += (d.price * d.qu);
    }

    return tPrice;
}
async function DelAllCart() {
    const response = await fetch('/cartdetails', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    if (response.ok) {
        console.log("data.message cart deleted"); 
    } else {
        console.error('Error:', data.error); 
    }

}
async function OrderDetails() {
    let arr = [];
    let ooid = [];
    let oID = 0;
    let od = await fetch('/getorder')
    let repo = await od.json()
    for (const oid of repo) {
        oID =   Math.max(oid.id,oID);
    }
    let cr = await fetch('/cartdetails');
    let crrepo = await cr.json();
    for (const bcr of crrepo) {
        let bd = await fetch(`/book_details/${parseInt(bcr.book_id)}`);
        let bdrepo = await bd.json();
        let obj = {
            orid:oID,
            bid:bcr.book_id,
            qu:bcr.quantity,
            pri : bdrepo.price
        }
        arr.push(obj)
    }
    loop(arr);
    
}
async function loop(arrs) {
    for (const det of arrs) {
        const response = await fetch('/add_order_detail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            order_id: det.orid,
            book_id: det.bid,
            quantity: det.qu,
            price: det.pri
        })})
        const data = await response.json();
        if (response.ok) {
            console.log('Order detail added:', data);
        } else {
            console.error('Error:', data.error);
        }
    }
}

// Payment 
var stripe = Stripe('pk_test_51PiAPE2K0ifXcFmugE1zPidjIqMKCj2eTS0dExGIrRBOTChSPXyXRYfnS9BxEtDlitPfNiXjqB7hS62TKxTUvvYu00Zxr39tJ1');
var elements = stripe.elements();
var style = {
    base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
            color: '#aab7c4'
        }
    },
    invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
    }
};
var card = elements.create('card', {style: style});
card.mount('#card-element');
card.addEventListener('change', function(event) {
    var displayError = document.getElementById('card-errors');
    if (event.error) {
        displayError.textContent = event.error.message;
    } else {
        displayError.textContent = '';
    }
});
var form = document.getElementById('payment-form');form.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    try {
        const { token, error } = await stripe.createToken(card);
        if (error) {
            document.getElementById('card-errors').textContent = error.message;
        } else {
            const totalPrice = await cartdetails();
            if(totalPrice!=0) {
                const response = await fetch('/add_order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: window.localStorage.getItem("userid"),
                        total_price: totalPrice,
                        status:"Success"
                    })
                });
                const data = await response.json();
                console.log(data)
                Swal.fire({
                    title: 'Success 🎉',
                    text: 'Purchasing successful',
                    icon: 'success',
                    customClass: {
                        popup: 'colored-popup'
                    }
                });
                   await OrderDetails();
                   await  DelAllCart();
                    stripeTokenHandler(token);
                    // window.location.pathname ="/main";
            } else {
                Swal.fire({
                    title: 'Error 🙄',
                    text: 'No items in carts ',
                    icon: 'error',
                    customClass: {
                        popup: 'colored-popup'
                    }
                })
            }
            
        }
    } catch (error) {
        console.error('Error:', error);
    }
});
  async function stripeTokenHandler(token) {
    var form = document.getElementById('payment-form');
    var hiddenInput = document.createElement('input');
    hiddenInput.setAttribute('type', 'hidden');
    hiddenInput.setAttribute('name', 'stripeToken');
    hiddenInput.setAttribute('value', token.id);
    form.appendChild(hiddenInput);
    form.submit();
}
