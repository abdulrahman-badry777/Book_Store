let regButton = document.querySelector(".regBut");
let myForm = document.querySelector('form');
let uMail = document.getElementById('Logmail');
let uPassword = document.getElementById('Logpassword');
regButton.onclick = function () {
    window.location.href = '/sign_up';
}
myForm.addEventListener('submit',function (event) {
    event.preventDefault();
    const email = uMail.value;
    const password = uPassword.value;
    if (email === '' || password === '') {
        Swal.fire({
            title: 'Error 🙄',
            text: 'Please fill in all fields',
            icon: 'error',
            customClass: {
                popup: 'colored-popup'
            }
        });
        return;
    }
    
    fetch('/users')
        .then(response => response.json())
        .then(users => {
            let user = false;
            let uid = 0;
            let userdet;
            for (let i = 0; i < users.length; i++) {
                if(users[i].email === email) {
                    user = true;
                    uid = users[i].id;
                    userdet = users[i];
                    break;
                }
                
            }
            // const user = users.find(user => user.email === email);
            if (user && userdet.password === password) {
                Swal.fire({
                    title: 'Success 🎉',
                    text: 'Login successful',
                    icon: 'success',
                    customClass: {
                        popup: 'colored-popup'
                    }
                }).then(() => {
                    window.localStorage.setItem("userid",`${uid}`)
                    window.location.pathname = '/main';
                });
            } else {
                Swal.fire({
                    title: 'Error 🙄',
                    text: 'Invalid email or password',
                    icon: 'error',
                    customClass: {
                        popup: 'colored-popup'
                    }
                });
            }
        })
        .catch(error => {
            Swal.fire({
                title: 'Error 🙄',
                text: 'Something went wrong!',
                icon: 'error',
                customClass: {
                    popup: 'colored-popup'
                }
            });
        });
});
