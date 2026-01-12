function renderStaffList() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://jsonserver-vercel-api.vercel.app/staffs");
    xhr.send();
    xhr.onload = function () {
        if (xhr.status === 200 && xhr.readyState === 4) {
            let staffList = JSON.parse(xhr.responseText);
            let htmls = staffList.map(function (staff) {
                return `
                <div class="col-md-3 mb-4">
                    <div class="card">
                        <img src="${staff.avatarUrl}" alt="" />
                        <!-- <div class="card-body"></div> -->
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item">
                                Name: ${staff.fullname}
                            </li>
                            <li class="list-group-item">
                                Gender: ${staff.gender ? "Male" : "Female"}
                            </li>
                            <li class="list-group-item">
                                Email: ${staff.email}
                            </li>
                            <li class="list-group-item">
                                Bir: ${dayjs(staff.dob).format("DD MM YYYY")}
                            </li>
                            <li class="list-group-item">
                                Phone: ${staff.mobile}
                            </li>
                        </ul>
                    </div>
                </div>
                `;
            });
            document.getElementById("staff-list").innerHTML = htmls.join("");
        }
    };
}
renderStaffList();