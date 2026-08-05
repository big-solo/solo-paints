const isLoggedIn = localStorage.getItem("adminLoggedIn");

if (isLoggedIn !== "true") {
    window.location.href = "admin-login.html";
}
let allContacts = [];
async function loadContacts() {
    try {
      const response = await fetch("http://localhost:5000/contacts", {
    headers: {
        "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
    }
});
if (response.status === 401) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminLoggedIn");
 
    window.location.href = "admin-login.html";
    return;
}
        const contacts = await response.json(); 
allContacts = contacts;

document.getElementById("totalContacts").textContent = contacts.length;
if (contacts.length > 0) {
    document.getElementById("latestContact").textContent =
        contacts[0].name;
} else {
    document.getElementById("latestContact").textContent = "None";
}
        const table = document.getElementById("tableBody");

        table.innerHTML = "";

        contacts.forEach(contact => {
            table.innerHTML += `
              <tr>
    <td>${contact.name}</td>
    <td>${contact.email}</td>
    <td>${contact.phone || "N/A"}</td>
    <td>${contact.service || "N/A"}</td>
    <td>${contact.message}</td>
    <td>${new Date(contact.createdAt).toLocaleDateString()}</td>
    <td>
        <button onclick="deleteContact('${contact._id}')">
            Delete
        </button>
    </td>
            `;
        });

    } catch (error) {
        console.error("Error loading contacts:", error);
    }
}


async function deleteContact(id) {
    const confirmDelete = confirm("Are you sure you want to delete this message?");

    if (!confirmDelete) {
        return;
    }

  try {
    await fetch(`http://localhost:5000/contacts/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        }
    }); 

        loadContacts();

    } catch (error) {
        console.error("Error deleting contact:", error);
    }
}


loadContacts();
document.getElementById("search").addEventListener("input", function () {

    const searchText = this.value.toLowerCase();

    const filteredContacts = allContacts.filter(contact =>
        contact.name?.toLowerCase().includes(searchText) ||
        contact.email?.toLowerCase().includes(searchText) ||
        contact.service?.toLowerCase().includes(searchText)
    );

    const table = document.getElementById("tableBody");

    table.innerHTML = "";

    filteredContacts.forEach(contact => {

        table.innerHTML += `
            <tr>
                <td>${contact.name}</td>
                <td>${contact.email}</td>
                <td>${contact.phone || "N/A"}</td>
                <td>${contact.service || "N/A"}</td>
                <td>${contact.message}</td>
                <td>${new Date(contact.createdAt).toLocaleDateString()}</td>
                <td>
                    <button onclick="deleteContact('${contact._id}')">
                        Delete
                    </button>
                </td>
            </tr>
        `;

    });

});
document.getElementById("logoutBtn").addEventListener("click", () => {

    localStorage.removeItem("adminLoggedIn");

    window.location.href = "admin-login.html";

});