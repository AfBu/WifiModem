$(window).on('load', function () {
    init_setup();
});

var data_bits = [5, 6, 7, 8];
var parity = ['N', 'E', 'O'];

function init_setup()
{
    $.get('/status', function (data) {
        // bauds
        for (var i in data.bauds) {
            var baud = data.bauds[i];
            var opt = $('<option></option>');
            opt.attr('value', baud);
            opt.html(baud);
            $('#bauds').append(opt);
        }
        $('#bauds').val(data.status.baud);

        // data bits
        for (var i in data_bits) {
            var bits = data_bits[i];
            var opt = $('<option></option>');
            opt.attr('value', bits);
            opt.html(bits + " bits");
            $('#databits').append(opt);
        }
        $('#databits').val(data.status.bits);

        // parity
        $('#parity').append('<option value="0">none</option>');
        $('#parity').append('<option value="1">even</option>');
        $('#parity').append('<option value="2">odd</option>');
        $('#parity').val(data.status.parity);

        // stop bits
        $('#stopbits').append('<option value="1">1 stop bit</option>');
        $('#stopbits').append('<option value="2">2 stop bit</option>');
        $('#stopbits').val(data.status.stopbits);

        // bauds
        for (var i in data.terminals) {
            var terminal = data.terminals[i];
            var opt = $('<option></option>');
            opt.attr('value', terminal);
            opt.html(terminal);
            $('#terminal').append(opt);
        }
        $('#terminal').val(data.status.terminal_type);

        // print wifi info
        if (!data.status.silent) 
            $('#silent').prop("checked", true);

        // handle telnet
        if (data.status.handle_telnet) 
            $('#telnet').prop("checked", true);
        
        assign_events();
    });
    update_directory();
}

function assign_events()
{
    $('#bauds').on('change', function () {
        set_value('baud', $('#bauds').val());
    });

    $('#databits').on('change', function () {
        set_value('bits', $('#databits').val());
    });

    $('#parity').on('change', function () {
        set_value('parity', parity[$('#parity').val()]);
    });

    $('#stopbits').on('change', function () {
        set_value('stopbits', $('#stopbits').val());
    });

    $('#terminal').on('change', function () {
        set_value('telnetTerminalType', $('#terminal').val());
    });

    $('#silent').on('click', function () {
        set_value('silent', ($('#silent').prop('checked') ? 'no' : 'yes'));
    });

    $('#telnet').on('click', function () {
        set_value('filterTelnet', ($('#telnet').prop('checked') ? 'yes' : 'no'));
    });

    $('#add-record').on('click', function () {
        var set = prompt("Enter line number:", '');

        if (set) {
            var val = prompt("Enter address for line number " + set + ":", '');
    
            if (val === null) {
                return;
            } else if (val != '') {
                update_directory(set, val);
            }
        }
    });
}

function set_value(key, value)
{
    var url = '/set?' + key + '=' + value;
    $.get(url);
}

function update_directory(set, val)
{
    var url = '/dir';
    var params = {};

    if (set != undefined && val != undefined) {
        params.set = set;
        params.val = val;
    } else if (set != undefined) {
        params.remove = set;
    }

    $('#directory-records').empty();
    $.post(url, params, function (data) {
        for (var i in data) {
            var address = data[i];
            var tr = $('<tr></tr>');
            tr.append($('<td>' + i + '</td>'));
            tr.append($('<td></td>').html(address));

            var td = $('<td align="right"></td>');
            var edit = $('<button></button>').html('EDIT');
            edit.attr('number', i);
            edit.attr('address', address);
            edit.on('click', edit_address);
            td.append(edit);
            tr.append(td);

            $('#directory-records').append(tr);
        }
    });
}

function edit_address()
{
    var val = prompt("Enter address for line number " + $(this).attr('number') + " (leave blank to delete):", $(this).attr('address'));
    
    if (val === null) {
        return;
    } else if (val != '') {
        update_directory($(this).attr('number'), val);
    } else {
        update_directory($(this).attr('number'));
    }
}