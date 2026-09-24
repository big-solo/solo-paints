const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const formData = new FormData();

    formData.append("name", document.getElementById("name").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("phone", document.getElementById("phone").value);
    formData.append("service", document.getElementById("service").value);
    formData.append("message", document.getElementById("message").value);

    const imageInput = document.getElementById("sampleImage");

    if (imageInput.files.length > 0) {
        formData.append("sampleImage", imageInput.files[0]);
    }

    try {

        const response = await fetch("https://solo-paints.onrender.com/contact", {

            method: "POST",

            body: formData

        });

        const result = await response.json();

        if (response.ok) {

            alert(result.message);

            contactForm.reset();

        } else {

            alert(result.message);

        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to the server.");

    }

  });
}
// Back To Top Button

const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", () => {

    if(window.scrollY > 300){
        topBtn.style.display = "block";
    }else{
        topBtn.style.display = "none";
    }

});

topBtn.addEventListener("click", () => {

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

});
// Loading Screen

window.addEventListener("load", () => {

    setTimeout(() => {

        document.getElementById("loader").style.display = "none";

    },1000);

});