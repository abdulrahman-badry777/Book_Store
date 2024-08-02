let bookList = document.querySelector(".book-list");
let arr = [];
let mySel = document.querySelector(".sel");
let tocaet = document.querySelector('.to_cart');
let ser_but = document.querySelector(".ser_but");
let ser_value = document.querySelector(".ser_val");
let app_but = document.querySelector(".app_but");
let to_purchasing = document.querySelector('.to_purchasing');
let to_my_purchasing = document.querySelector('.to_your_purchasing');
if(window.location.pathname === '/main') {
    fetch('/books')
    .then(response => response.json())
    .then(data => data.forEach(d => {
        let myDiv = document.createElement("div");
        let myImg = document.createElement("img");
        let myP = document.createElement("p");
        myImg.src = `../static/imgs/${d.src}.png`;
        myImg.dataset.img = d.id;
        myImg.dataset.category = d.category;
        myP.innerHTML = `${d.title}`
        myDiv.classList.add("book-item");
        myDiv.appendChild(myImg);
        myDiv.appendChild(myP);
        bookList.appendChild(myDiv);
        arr.push(`${d.category}`);
  })).then(array => {
        let uniqueArray = [...new Set(arr)];
        for (let i = 0; i < uniqueArray.length; i++) {
            let myOpt = document.createElement("option");
            myOpt.innerHTML = `${uniqueArray[i]}`;
            mySel.appendChild(myOpt);
        }})
        tocaet.addEventListener('click',function () {
            window.location.pathname = '/cart'
        })
        to_purchasing.addEventListener('click',function () {
            window.location.pathname = '/purchasing'
        })
        to_my_purchasing.addEventListener('click',function () {
            window.location.pathname = '/my_purchasing'
        })
        let check = false;
        ser_but.addEventListener('click',function () {
            if(ser_value.value === '' ||ser_value.value === ' ' ) {
                for (let i = 0; i < bookList.childElementCount; i++) {
                    bookList.children[i].classList.remove('remove');
                }
            }
            else {
        for (let i = 0; i < bookList.childElementCount; i++) {
            if(bookList.children[i].children[1].innerHTML ===ser_value.value ) {
                check = true;
            }
        }
        if(true) {
            for(let i = 0; i < bookList.childElementCount; i++) {
                if(bookList.children[i].children[1].innerHTML !==ser_value.value ) {
                    bookList.children[i].classList.add('remove');
                }
            }
        }
    }
        })

        app_but.addEventListener('click',function () {
            if(mySel.value) {
                for (let i = 0; i < bookList.childElementCount; i++) {
                    if(bookList.children[i].children[0].getAttribute("data-category") !== mySel.value ) {
                        bookList.children[i].classList.add('remove');
                    }
                    else {
                        bookList.children[i].classList.remove('remove');
                    }
                    
                }
            }
            
            
        })

};
let myImgID = 0;
document.addEventListener('click',function (e) {
    if(e.target.hasAttribute("data-img")) {
        window.localStorage.setItem("bookdetID",`${parseInt(e.target.getAttribute("data-img"))}`); 
        window.location.pathname = '/bookdetail';
    }
})

if(window.location.pathname === '/bookdetail') {
    const bookId = window.localStorage.getItem("bookdetID");
            if (bookId) {
                fetch(`/book_details/${bookId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.error) {
                            document.getElementById('book-details').innerHTML = `<p>${data.error}</p>`;
                        } else {
                            document.getElementById('book-details').innerHTML = `
                                <img src="../static/imgs/${data.src}.png" alt="${data.title}">
                                <h1>${data.title}</h1>
                                <p><strong>Author:</strong> ${data.author}</p>
                                <p><strong>Description:</strong> ${data.description}</p>
                                <p><strong>Category:</strong> ${data.category}</p>
                                <div class="actions">
                                    <input type="number" id="quantity" min="1" value="1">
                                    <button id="add-to-cart">Add to Cart</button>
                                </div>
                            `;
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching book details:', error);
                        document.getElementById('book-details').innerHTML = '<p>Failed to load book details.</p>';
                    });
            } else {
                document.getElementById('book-details').innerHTML = '<p>No book ID provided.</p>';
            }
            document.addEventListener('DOMContentLoaded', function () {
                document.addEventListener('click', function (e) {
                    if (e.target.id === 'add-to-cart') {
                        const userId = window.localStorage.getItem("userid");
                        const bookId = window.localStorage.getItem("bookdetID");
                        const quantity = parseInt(document.getElementById("quantity").value);
                            fetch('/cartdetails')
                            .then(re=> re.json())
                            .then(det => {
                        const contactExists = det.find(detail => detail.book_id === parseInt(bookId));
                                if(contactExists) {
                                    Swal.fire({
                                        title: 'Error 🙄',
                                        text: 'Error The book id is exist ',
                                        icon: 'error',
                                        customClass: {
                                            popup: 'colored-popup'
                                        }
                                    });
                                } else {
                                    fetch('/add_to_cart', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            user_id: userId,
                                            book_id: bookId,
                                            quantity: quantity
                                        })
                                    })
                                    .then(response => response.json())
                                    .then(data => {
                                        console.log(data);
                                        if (data) {
                                            Swal.fire({
                                                title: 'Success 🎉',
                                                text: 'Added successfully',
                                                icon: 'success',
                                                customClass: {
                                                    popup: 'colored-popup'
                                                }
                                            });
                                        } else {
                                            Swal.fire({
                                                title: 'Error 🙄',
                                                text: 'Error in adding',
                                                icon: 'error',
                                                customClass: {
                                                    popup: 'colored-popup'
                                                }
                                            });
                                        }
                                    })
                                    .catch(error => {
                                        console.error('Error:', error);
                                        Swal.fire({
                                            title: 'Error 🙄',
                                            text: 'Something went wrong',
                                            icon: 'error',
                                            customClass: {
                                                popup: 'colored-popup'
                                            }
                                        });
                                    });
                                }
                            })
                        }
                    })
                })
};
