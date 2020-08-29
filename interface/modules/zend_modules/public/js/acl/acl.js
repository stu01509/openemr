/**
 * interface/modules/zend_modules/public/js/acl/acl.js
 *
 * @package   OpenEMR
 * @link      https://www.open-emr.org
 * @author    Jacob T.Paul <jacob@zhservices.com>
 * @author    Basil P T <basil@zhservices.com>
 * @copyright Copyright (c) 2013 Z&H Consultancy Services Private Limited <sam@zhservices.com>
 * @license   https://github.com/openemr/openemr/blob/master/LICENSE GNU General Public License 3
 */

// Global variables
// eslint-disable-next-line no-var
var selected_user = '';
// eslint-disable-next-line no-var
var selected_component = '';
// eslint-disable-next-line no-var
var allowed_array = [];
// eslint-disable-next-line no-var
var denied_array = [];

function createtree() {
    $('#td_componets,#td_users,#td_allowed_users,#td_denied_users').treeview({
        animated: 'fast',
        collapsed: true,
        control: '#control_div',
    });
}

$(document).mouseup(function (e) {
    const container = $('.popup_items');
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        $('.popup_items').css('display', 'none');
    }
});

$(window).load(function () {
    $('.scrollable').customScrollbar();
});

$(document).one('mouseover', function () {
    $('.scrollable').customScrollbar('resize');
    $('#expand_tree').click();
});

function saveGroupAcl() {
    const ACL_DATA = {};
    ACL_DATA.allowed = {};
    ACL_DATA.denied = {};
    let i = -1;
    $('#table_acl').find('input:checkbox').each(function () {
        const id = $(this).attr('id');
        const id_arr = id.split('_');

        if ($(this).is(':checked')) {
            i += 1;
            if (!ACL_DATA.allowed[id_arr[0]]) ACL_DATA.allowed[id_arr[0]] = {};
            ACL_DATA.allowed[id_arr[0]][i] = id_arr[1];
        } else {
            i += 1;
            if (!ACL_DATA.denied[id_arr[0]]) ACL_DATA.denied[id_arr[0]] = {};
            ACL_DATA.denied[id_arr[0]][i] = id_arr[1];
        }
    });
    $.ajax({
        type: 'POST',
        url: ajax_path,
        dataType: 'html',
        data: {
            ajax_mode: 'save_acl_advanced',
            acl_data: JSON.stringify(ACL_DATA),
            module_id,
        },
        async: false,
        success(thedata) {
            const resultTranslated = js_xl('ACL Updated Successfully');
            $('#messages_div').html(resultTranslated.msg);
            setTimeout(function () {
                $('#messages_div').html('');
            }, 3000);
        },
    });
}

function saveAcl() {
    if (selected_component === '') {
        const resultTranslated = js_xl('Select a Component');
        alert(resultTranslated.msg);
        return;
    }
    $('.scrollable').customScrollbar('resize');
    const selected_module = selected_component;
    const allowed_users = JSON.stringify(allowed_array);
    const denied_users = JSON.stringify(denied_array);
    $.ajax({
        type: 'POST',
        url: ajax_path,
        dataType: 'html',
        data: {
            ajax_mode: 'save_acl',
            selected_module,
            allowed_users,
            denied_users,
        },
        async: false,
        success(thedata) {
            const resultTranslated = js_xl('ACL Updated Successfully');
            $('#messages').html(resultTranslated.msg);
            setTimeout(function () {
                $('#messages').html('');
            }, 3000);
        },
    });
}

$(function () {
    $('.popup_items').draggable();
    createtree();
    $('.draggable2').draggable({
        containment: '#outer_table',
        scroll: false,
        revert: true,
        drag() {
            selected_user = this.id;
        },
    });
    $('.draggable3').draggable({
        containment: '#outer_table',
        scroll: false,
        revert: true,
        drag() {
            selected_user = this.id;
        },
    });
    $('.draggable4').draggable({
        containment: '#outer_table',
        scroll: false,
        revert: true,
        drag() {
            selected_user = this.id;
        },
    });
    $('.delete_droppable').droppable({
        accept: '.draggable3,.draggable4',
        activeClass: 'deleted',
        over(event, ui) {
            $('.delete_droppable').addClass('red');
            setTimeout(function () {
                $('.delete_droppable').removeClass('red');
            }, 400);
        },
        drop(event, ui) {
            let user_delete = false;
            let invalid_group = false;
            const arr_id = selected_user.split('-');
            if (arr_id[1] === 0) {
                if ($(`#${selected_user}`).css('opacity') === '1') {
                    $(`#li_${selected_user}`).css('display', 'none');
                    $(`#li_${selected_user}`).find('li').css('display', 'none');
                } else {
                    invalid_group = true;
                }
            } else {
                user_delete = true;
            }

            if (selected_user.indexOf('user_group_allowed_') !== -1) {
                if (arr_id[1] === 0 && !user_delete && !invalid_group) {
                    const index = allowed_array.indexOf(`li_${selected_user}`);
                    if (index !== -1) {
                        allowed_array.splice(index, 1);
                    } else {
                        $(`#li_${selected_user}`).find('li').each(function () {
                            const index_1 = allowed_array.indexOf($(this).attr('id'));
                            if (index_1 !== -1) allowed_array.splice(index_1, 1);
                        });
                    }
                }
            } else if (selected_user.indexOf('user_group_denied_') !== -1) {
                if (arr_id[1] === 0 && !user_delete && !invalid_group) {
                    const index = denied_array.indexOf(`li_${selected_user}`);
                    if (index !== -1) {
                        denied_array.splice(index, 1);
                    } else {
                        $(`#li_${selected_user}`).find('li').each(function () {
                            const index_1 = denied_array.indexOf($(this).attr('id'));
                            if (index_1 !== -1) denied_array.splice(index_1, 1);
                        });
                    }
                }
            }
            if (user_delete) {
                const resultTranslated = js_xl('User Cannot be Deleted');
                $('#messages').html(resultTranslated.msg);
                setTimeout(function () {
                    $('#messages').html('');
                }, 3000);
            } else if (invalid_group) {
                const resultTranslated = js_xl('Please Select an Active Group');
                $('#messages').html(resultTranslated.msg);
                setTimeout(function () {
                    $('#messages').html('');
                }, 3000);
            } else {
                saveAcl();
            }
        },
    });
    $('.droppableAllowed').droppable({
        accept: '.draggable2,.draggable4',
        drop() {
            let dragged_from_denied = false;
            if (selected_user.indexOf('user_group_denied_') !== -1) {
                dragged_from_denied = true;
                const new_id = selected_user.replace('user_group_denied_', 'user_group_allowed_');
                const denied_id = selected_user;
                const arr_id = selected_user.split('-');
                if (arr_id[1] !== 0) {
                    let li_cout = 0;
                    $($($(`#li_${selected_user}`).parent().get(0)).parent().get(0)).find('li').each(function () {
                        if ($(this).css('display') === 'list-item') {
                            li_cout += 1;
                        }
                    });
                    $(`#li_${selected_user}`).css('display', 'none');
                }
            } else {
                new_id = selected_user.replace('user_group_', 'user_group_allowed_');
                denied_id = selected_user.replace('user_group_', 'user_group_denied_');
            }
            const target_visibility = $(`#li_${new_id}`).css('display');
            $(`#li_${new_id}`).css('display', '');
            const arr_id = selected_user.split('-');
            if (arr_id[1] === 0) {
                // Add to array -- allowed
                if (dragged_from_denied) {
                    const source_opacity = $(`#${selected_user}`).css('opacity');
                    const target_opacity = $(`#${new_id}`).css('opacity');
                    const new_opacity = (target_opacity === '1' && target_visibility !== 'none') ? '1' : source_opacity;
                    $(`#${new_id}`).css('opacity', new_opacity);
                    const index = denied_array.indexOf(`li_${selected_user}`);
                    if (index !== -1) {
                        if (allowed_array.indexOf(new_id) === -1) {
                            allowed_array.push(`li_${new_id}`);
                        }
                        $(`#li_${new_id}`).find('li').each(function () {
                            const child_id = $(this).attr('id');
                            const index = allowed_array.indexOf(child_id);
                            if (index !== -1) {
                                allowed_array.splice(index, 1);
                            }
                        });
                    } else if (allowed_array.indexOf(new_id) === -1) {
                        $(`#li_${selected_user}`).find('li').each(function () {
                            if ($(this).css('display') === 'list-item') {
                                const id = $(this).attr('id').replace('user_group_denied_', 'user_group_allowed_');
                                if (allowed_array.indexOf(id) === -1) {
                                    allowed_array.push(id);
                                }
                            }
                        });
                    }
                } else {
                    if (allowed_array.indexOf(new_id) === -1) allowed_array.push(`li_${new_id}`);
                    $(`#li_${new_id}`).find('li').each(function () {
                        const child_id = $(this).attr('id');
                        const index = allowed_array.indexOf(child_id);
                        if (index !== -1) {
                            allowed_array.splice(index, 1);
                        }
                    });
                }

                // Remove From Denied Array
                const index = denied_array.indexOf(`li_${denied_id}`);
                if (index !== -1) {
                    denied_array.splice(index, 1);
                }
                const parent_id = $($($(`#li_${denied_id}`).parent().get(0)).parent().get(0)).attr('id');
                $(`#li_${denied_id}`).find('li').each(function () {
                    const child_id = $(this).attr('id');
                    const index = denied_array.indexOf(child_id);
                    if (index !== -1) {
                        denied_array.splice(index, 1);
                    }
                });

                if (dragged_from_denied) {
                    const index = denied_array.indexOf(`li_${selected_user}`);
                    if (index !== -1) {
                        $(`#li_${new_id}`).find('li').css('display', '');
                    } else {
                        $(`#li_${selected_user}`).find('li').each(function () {
                            if ($(this).css('display') === 'list-item') {
                                const id = $(this).attr('id').replace('user_group_denied_', 'user_group_allowed_');
                                $(`#${id}`).css('display', '');
                                $(`#${id}`).find('div:eq(1)').css('opacity', '1');
                            }
                        });
                    }
                } else {
                    $(`#li_${new_id}`).find('li').css('display', '');
                    $(`#li_${new_id}`).find('div:eq(1)').css('opacity', '1');
                }
                $(`#li_${denied_id}`).find('li').css('display', 'none');
                $(`#li_${denied_id}`).css('display', 'none');
            } else {
                // Add to array -- allowed
                const parent_id = $($($(`#li_${new_id}`).parent().get(0)).parent().get(0)).attr('id');
                if (allowed_array.indexOf(`li_${new_id}`) === -1 && allowed_array.indexOf(parent_id) === -1) {
                    allowed_array.push(`li_${new_id}`);
                }

                $($($(`#li_${new_id}`).parent().get(0)).parent().get(0)).css('display', '');
                if (new_id.substr(-2) !== '-0' && (allowed_array.indexOf(parent_id) === -1 || !dragged_from_denied)) {
                    $($($(`#li_${new_id}`).parent().get(0)).parent().get(0)).find('div:eq(1)').css('opacity', '0.5');
                }
                let li_cout = 0;
                $(`#li_${denied_id}`).css('display', 'none');
                $($($(`#li_${denied_id}`).parent().get(0)).parent().get(0)).find('li').each(function () {
                    if ($(this).css('display') === 'list-item') {
                        li_cout += 1;
                    }
                });
                if (li_cout === 0 && $(`#${parent_id.replace('li_', '').replace('allowed', 'denied')}`).css('opacity') !== '1') {
                    $($($(`#li_${denied_id}`).parent().get(0)).parent().get(0)).css('display', 'none');
                }

                const index = denied_array.indexOf(`li_${denied_id}`);
                if (index !== -1) {
                    denied_array.splice(index, 1);
                }
            }
            saveAcl();
        },
    });
    $('.droppableDenied').droppable({
        accept: '.draggable2,.draggable3',
        drop() {
            let dragged_from_allowed = false;
            if (selected_user.indexOf('user_group_allowed_') !== -1) {
                dragged_from_allowed = true;
                const new_id = selected_user.replace('user_group_allowed_', 'user_group_denied_');
                const denied_id = selected_user;
                const arr_id = selected_user.split('-');
                if (arr_id[1] !== 0) {
                    let li_cout = 0;
                    $($($(`#li_${selected_user}`).parent().get(0)).parent().get(0)).find('li').each(function () {
                        if ($(this).css('display') === 'list-item') {
                            li_cout += 1;
                        }
                    });
                    $(`#li_${selected_user}`).css('display', 'none');
                }
            } else {
                new_id = selected_user.replace('user_group_', 'user_group_denied_');
                denied_id = selected_user.replace('user_group_', 'user_group_allowed_');
            }

            const target_visibility = $(`#li_${new_id}`).css('display');
            $(`#li_${new_id}`).css('display', '');
            const arr_id = selected_user.split('-');
            if (arr_id[1] === 0) {
                const source_opacity = $(`#${selected_user}`).css('opacity');
                const target_opacity = $(`#${new_id}`).css('opacity');
                const new_opacity = (target_opacity === '1' && target_visibility !== 'none') ? '1' : source_opacity;
                $(`#${new_id}`).css('opacity', new_opacity);
                // Add to array -- denied
                if (dragged_from_allowed) {
                    let index = allowed_array.indexOf(`li_${selected_user}`);
                    if (index !== -1) {
                        if (denied_array.indexOf(new_id) === -1) {
                            denied_array.push(`li_${new_id}`);
                        }
                        $(`#li_${new_id}`).find('li').each(function () {
                            const child_id = $(this).attr('id');
                            index = denied_array.indexOf(child_id);
                            if (index !== -1) {
                                denied_array.splice(index, 1);
                            }
                        });
                    } else if (denied_array.indexOf(new_id) === -1) {
                        $(`#li_${selected_user}`).find('li').each(function () {
                            if ($(this).css('display') === 'list-item') {
                                const id = $(this).attr('id').replace('user_group_allowed_', 'user_group_denied_');
                                if (denied_array.indexOf(id) === -1) {
                                    denied_array.push(id);
                                }
                            }
                        });
                    }
                } else {
                    if (denied_array.indexOf(new_id) === -1) {
                        denied_array.push(`li_${new_id}`);
                    }
                    $(`#li_${new_id}`).find('li').each(function () {
                        const child_id = $(this).attr('id');
                        const index = denied_array.indexOf(child_id);
                        if (index !== -1) {
                            denied_array.splice(index, 1);
                        }
                    });
                }

                // Remove From Allowed Array
                let index = allowed_array.indexOf(`li_${denied_id}`);
                if (index !== -1) {
                    allowed_array.splice(index, 1);
                }
                const parent_id = $($($(`#li_${denied_id}`).parent().get(0)).parent().get(0)).attr('id');
                $(`#li_${denied_id}`).find('li').each(function () {
                    const child_id = $(this).attr('id');
                    const index = allowed_array.indexOf(child_id);
                    if (index !== -1) {
                        allowed_array.splice(index, 1);
                    }
                });
                if (dragged_from_allowed) {
                    index = allowed_array.indexOf(`li_${selected_user}`);
                    if (index !== -1) {
                        $(`#li_${new_id}`).find('li').css('display', '');
                    } else {
                        $(`#li_${selected_user}`).find('li').each(function () {
                            if ($(this).css('display') === 'list-item') {
                                const id = $(this).attr('id').replace('user_group_allowed_', 'user_group_denied_');
                                $(`#${id}`).css('display', '');
                                $(`#${id}`).find('div:eq(1)').css('opacity', '1');
                            }
                        });
                    }
                } else {
                    $(`#li_${new_id}`).find('li').css('display', '');
                    $(`#li_${new_id}`).find('div:eq(1)').css('opacity', '1');
                }
                $(`#li_${denied_id}`).find('li').css('display', 'none');
                $(`#li_${denied_id}`).css('display', 'none');
            } else {
                // Add to array -- denied
                const parent_id = $($($(`#li_${new_id}`).parent().get(0)).parent().get(0)).attr('id');
                if (denied_array.indexOf(`li_${new_id}`) === -1 && denied_array.indexOf(parent_id) === -1) {
                    denied_array.push(`li_${new_id}`);
                }

                $($($(`#li_${new_id}`).parent().get(0)).parent().get(0)).css('display', 'display');
                if (new_id.substr(-2) !== '-0' && (denied_array.indexOf(parent_id) === -1 || !dragged_from_allowed)) {
                    $($($(`#li_${new_id}`).parent().get(0)).parent().get(0)).find('div:eq(1)').css('opacity', '0.5');
                }
                $(`#li_${denied_id}`).css('display', 'none');
                let li_cout = 0;

                $($($(`#li_${denied_id}`).parent().get(0)).parent().get(0)).find('li').each(function () {
                    if ($(this).css('display') === 'list-item') {
                        li_cout += 1;
                    }
                });
                if (li_cout === 0 && $(`#${parent_id.replace('li_', '').replace('denied', 'allowed')}`).css('opacity') !== '1') {
                    $($($(`#li_${denied_id}`).parent().get(0)).parent().get(0)).css('display', 'none');
                }

                const index = allowed_array.indexOf(`li_${denied_id}`);
                if (index !== -1) {
                    allowed_array.splice(index, 1);
                }
            }
            saveAcl();
        },
    });
    $('.module_check').click(function () {
        const clicked_id = $(this).attr('id');
        const clicked_arr = clicked_id.split('_');
        if ($(this).is(':checked')) {
            $(`.group_${clicked_arr[1]}`).attr('checked', true);
        } else {
            $(`.group_${clicked_arr[1]}`).removeAttr('checked');
        }
        saveGroupAcl();
    });
    $('.component_check').click(function () {
        saveGroupAcl();
    });
});

function selectThis(id) {
    $('.selected_componet').removeClass('selected_componet');
    $(`#${id}`).addClass('selected_componet');
    selected_component = id;
}

function rebuild() {
    const denied_array = [];
    const allowed_array = [];
    $.ajax({
        type: 'POST',
        url: ajax_path,
        dataType: 'html',
        data: {
            ajax_mode: 'rebuild',
            selected_module: selected_component,
        },
        async: false,
        success(thedata) {
            $('.class_li').css('display', 'none');
            const obj = JSON.parse(thedata);
            // Allowed Groups

            for (const index in obj.group_allowed) {
                if (Object.prototype.hasOwnProperty.call(obj.group_allowed, index)) {
                    $(`#li_user_group_allowed_${obj.group_allowed.index}-0`).css('display', '');
                    $(`#li_user_group_allowed_${obj.group_allowed.index}-0`).find('li').css('display', '');
                    allowed_array.push(`li_user_group_allowed_${obj.group_allowed.index}-0`);
                }
            }

            // Denied Groups
            for (const index in obj.group_denied) {
                if (Object.prototype.hasOwnProperty.call(obj.group_denied, index)) {
                    $(`#li_user_group_denied_${obj.group_denied.index}-0`).css('display', '');
                    $(`#li_user_group_denied_${obj.group_denied.index}-0`).find('li').css('display', '');
                    denied_array.push(`li_user_group_denied_${obj.group_denied.index}-0`);
                }
            }

            // Allowed users
            for (const index in obj.user_allowed) {
                if (Object.prototype.hasOwnProperty.call(obj.user_allowed, index)) {
                    if ($(`#li_user_group_allowed_${index}-0`).css('display') === 'none') {
                        $(`#li_user_group_allowed_${index}-0`).css('display', '');
                        $(`#li_user_group_allowed_${index}-0`).find('div:eq(1)').css('opacity', '0.5');
                    }
                    for (const k in obj.user_allowed.index) {
                        if (Object.prototype.hasOwnProperty.call(obj.user_allowed.index, k)) {
                            $(`#li_user_group_allowed_${index}-${obj.user_allowed.index.k}`).css('display', '');
                            $(`#li_user_group_denied_${index}-${obj.user_allowed.index.k}`).css('display', 'none');
                            allowed_array.push(`li_user_group_allowed_${index}-${obj.user_allowed.index.k}`);
                        }
                    }
                }
            }
            // Denied users
            for (const index in obj.user_denied) {
                if (Object.prototype.hasOwnProperty.call(obj.user_denied, index)) {
                    if ($(`#li_user_group_denied_${index}-0`).css('display') === 'none') {
                        $(`#li_user_group_denied_${index}-0`).find('div:eq(1)').css('opacity', '0.5');
                        $(`#li_user_group_denied_${index}-0`).css('display', '');
                    }
                    for (const k in obj.user_denied.index) {
                        if (Object.prototype.hasOwnProperty.call(obj.user_denied.index, k)) {
                            $(`#li_user_group_denied_${index}-${obj.user_denied.index.k}`).css('display', '');
                            $(`#li_user_group_allowed_${index}-${obj.user_denied.index.k}`).css('display', 'none');
                            denied_array.push(`li_user_group_denied_${index}-${obj.user_denied.index.k}`);
                        }
                    }
                }
            }
        },
    });
}

function addNewItem(section) {
    $('.popup_items').css('display', 'none');
    $(`#add_new_${section}`).slideDown();
}

function getSectionById(mod_id) {
    $('#add_component_section_identifier').val('');
    $('#add_component_section_name').val('');
    if (mod_id === '') {
        $('#add_component_section_id').html('');
        return;
    }

    $.ajax({
        type: 'POST',
        url: ajax_path,
        dataType: 'html',
        data: {
            ajax_mode: 'get_sections_by_module',
            module_id: mod_id,
        },
        async: false,
        success(thedata) {
            const obj = JSON.parse(thedata);
            let out = "<option value=''></option>";
            for (const index in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, index)) {
                    out += `<option value='${index}'>${obj[index]}</option>`;
                }
            }
            $('#add_component_section_id').html(out);
        },
    });
}

function addSectionSave() {
    const mod_id = $('#add_component_mod_id').val();
    const parent_id = $('#add_component_section_id').val();
    const section_identifier = $('#add_component_section_identifier').val();
    const section_name = $('#add_component_section_name').val();
    if ($.trim(section_identifier) === '' || $.trim(section_name) === '') {
        const resultTranslated = js_xl('Section ID and Name Cannot be Empty');
        alert(resultTranslated.msg);
        return;
    }
    $.ajax({
        type: 'POST',
        url: ajax_path,
        dataType: 'html',
        data: {
            ajax_mode: 'save_sections_by_module',
            mod_id,
            parent_id,
            section_identifier,
            section_name,
        },
        async: false,
        success(thedata) {
            const resultTranslated = js_xl('Section saved successfully');
            $('#add_component_section_message').html(resultTranslated.msg);
            setTimeout(function () {
                $('#add_component_section_message').html('');
            }, 3000);
        },
    });
}
