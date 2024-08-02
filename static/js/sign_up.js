let myForm = document.querySelector('form');
let fName = document.getElementById("first_name");
let lName = document.getElementById("last_name");
let email = document.getElementById("email");
let password = document.getElementById("password");
let conPassword = document.getElementById("confirmpassword");
myForm.addEventListener('submit',function (event) {
    event.preventDefault();
    let fNameReg = /^[a-zA-Z]/i
    let lNameReg = /^[a-zA-Z]/i
    let emailReg = /^\w+@(gmail|outlook)\.(com|net)$/i
    let bfname =fNameReg.test(fName.value);
    let blname =lNameReg.test(lName.value);
    let bemail = emailReg.test(email.value);
    const formData = new FormData(event.target);
    const newUser = {
        first_name: formData.get('first_name'),
        last_name: formData.get('last_name'),
        email: formData.get('email'),
        password: formData.get('password')
    };
    if(bfname &&blname&&bemail&& (fName.value != ''&&lName.value != ''&&email.value != ''&&password.value != '' && conPassword.value!= '') && password.value === conPassword.value) {
        fetch('/users')
        .then(response => response.json())
        .then(users => {
            const emailExists = users.some(user => user.email === email.value);
            if (emailExists) {
                    Swal.fire({
                        title: 'Error 🙄',
                        text: 'Existing Users',
                        icon: 'error',
                        customClass: {
                            popup: 'colored-popup'
                        }
                        });
            } else {
                fetch('/add_user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newUser)
                })
                .then(response => response.json())
                .then(data => {
                    Swal.fire({
                        title: 'Congrats 🥳',
                        text: 'Details added successfully',
                        icon: 'success',
                        customClass: {
                            popup: 'colored-popup'
                        }
                    });
                    window.location.href = '/'
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
            }
        });
} else {
    Swal.fire({
        title: 'Error 🙄',
        text: 'Please fill all the fields correctly',
        icon: 'error',
        customClass: {
            popup: 'colored-popup'
        }
    });
}
});