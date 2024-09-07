function delProd(id) {
    $(".modal-confirm-deleteProd").css({
        display: "flex",
    });
    $('.btn-delete-prod').attr('href', `/del-user?id=${id}`)
}

function editCliente(id) {
    $("#form-edit").attr('action', `/edit-user?id=${id}`)
}