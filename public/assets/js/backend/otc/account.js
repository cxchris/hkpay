define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {
    var Controller = {
        index: async function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'otc/account/index',
                    add_url: 'otc/account/add',
                    edit_url: 'otc/account/edit',
                    del_url: 'otc/account/del',
                }
            });
            var _this = this;

            var table = $("#table");

            //当表格数据加载完成时
            table.on('load-success.bs.table', function (e, json) {
                // console.log(json)
                // $("#money").text(json.extend.money);
                // $("#total").text(json.extend.total);
                // $("#price").text(json.extend.price);
                // $("#tax").text(json.extend.tax);
                // $("#rate").text(json.extend.rate);
            });

            table.on('post-body.bs.table', function (e, settings, json, xhr) {
                $(".btn-amount").data("end", function(){
                    //关闭后的事件
                    $('.btn-refresh').trigger('click')
                });
            });

            const typelist = await $.getJSON("otc/account/channelList")

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                fixedColumns: true,
                fixedNumber: 0,
                fixedRightNumber: 1,
                //禁用默认搜索
                search: false,
                //启用普通表单搜索
                commonSearch: true,
                //可以控制是否默认显示搜索单表,false则隐藏,默认为false
                searchFormVisible: true,
                columns: [
                    [
                        { field: 'id', title: 'id' },
                        // {field: 'orderno', title: '商户号'},
                        { field: 'account_name', title: '账户名' },
                        { field: 'account_number', title: '账户' },
                        {
                            field: 'status', 
                            title: '状态', 
                            formatter: Table.api.formatter.status,
                            custom: {0: 'error', 1: 'success'},
                            searchList: {0: '关闭',1: '启用'}
                        },
                        // {field: 'ifsc', title: '银行编码'},
                        { field: 'pkgbank', title: '账户所属银行' },
                        { field: 'channel_name', title: '通道类型', formatter: Table.api.formatter.label, searchList: typelist },

                        { field: 'email', title: '邮箱',operate:false },
                        { field: 'password', title: '应用密码',operate:false },
                        { field: 'host', title: 'host',operate:false },
                        { field: 'port', title: '端口号',operate:false },
                        { field: 'keyword', title: '关键字',operate:false },
                        { field: 'regex', title: '正则',operate:false },
                        { field: 'poster', title: '限制发送者邮箱', operate: false },
                        
                        { field: 'day_limit', title: '每日限额', operate: false },


                        {
                            field: 'isfloat', 
                            title: '浮动金额', 
                            formatter: Table.api.formatter.status,
                            custom: {0: 'error', 1: 'success'},
                            searchList: {0: '关闭',1: '开启'}
                        },

                        
                        {field: 'create_time', title: '创建时间',  operate: 'RANGE', addclass: 'datetimerange', sortable: true,operate:false},

                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, 
                            formatter: function (value, row, index) {
                                return Table.api.formatter.operate.call(this, value, row, index);
                            }
                        }
                        
                    ]
                ],
            });

            $("input[type='text']").each(function (index) {
                this.autocomplete = "off";
            })

            // 为表格绑定事件
            Table.api.bindevent(table);
        },
        api:{
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            },
            events: {
                operate: {
                    
                }
            },
            formatter: {
                operate: function (value, row, index) {
                    var table = this.table;
                    // 操作配置
                    var options = table ? table.bootstrapTable('getOptions') : {};
                    // 默认按钮组
                    var buttons = $.extend([], this.buttons || []);
                    // 所有按钮名称
                    var names = [];
                    buttons.forEach(function (item) {
                        names.push(item.name);
                    });
                    if (options.extend.dragsort_url !== '' && names.indexOf('dragsort') === -1) {
                        buttons.push({
                            name: 'dragsort',
                            icon: 'fa fa-arrows',
                            title: __('Drag to sort'),
                            extend: 'data-toggle="tooltip"',
                            classname: 'btn btn-xs btn-primary btn-dragsort'
                        });
                    }
                    if (options.extend.edit_url !== '' && names.indexOf('edit') === -1) {
                        buttons.push({
                            name: 'edit',
                            icon: 'fa fa-pencil',
                            title: __('Edit'),
                            extend: 'data-toggle="tooltip" data-area=["100%","100%"]',
                            classname: 'btn btn-xs btn-success btn-dialog ',
                            url: options.extend.edit_url
                        });
                    }

                    return Table.api.buttonlink(this, buttons, value, row, index, 'operate');
                }
            }
        },
        add: function () {
            Form.api.bindevent($("form[role=form]"));
        },
        edit: function () {
            Form.api.bindevent($("form[role=form]"));
        },
    };
    return Controller;
    
});
