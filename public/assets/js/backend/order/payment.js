define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'order/payment/index',
                }
            });

            var _this = this;
            var table = $("#table");
            var group_id = Config.admin.group_id;

            //当表格数据加载完成时
            table.on('load-success.bs.table', function (e, json) {
                // console.log(json)
                $("#money").text(json.extend.money);
                $("#total").text(json.extend.total);
                $("#price").text(json.extend.price);
                $("#tax").text(json.extend.tax);
                $("#rate").text(json.extend.rate);
            });

            table.on('post-body.bs.table', function (e, settings, json, xhr) {
                $(".btn-amount").data("end", function(){
                    //关闭后的事件
                    $('.btn-refresh').trigger('click')
                });
            });

            var columns = [];
            var fixedRightNumber = 0;
            if(group_id == 2){
                columns = [
                    {field: 'orderno', title: '平台订单号'},
                    {field: 'out_trade_no', title: '商户订单号'},
                    {field: 'tn', title: '三方订单号'},
                    {
                        field: 'channel_id', title: '代付通道',
                        formatter: function (value,row) {
                            return row.channel_name+'('+value+')';
                        },
                        searchList: $.getJSON("order/payment/colselect")
                    },
                    
                    {
                        field: 'status_type', 
                        title: '状态(上游)',
                        operate:false,
                        formatter: Table.api.formatter.label,
                        custom: {'待处理': 'info', '处理中': 'default','成功':'success','失败':'warning','下单失败':'danger'},
                    },
                    {
                        field: 'status', 
                        title: '状态(上游)',
                        visible:false,
                        searchList: Object.assign({},$.getJSON("order/payment/typeList"))
                    },

                    {field: 'merchant_number', title: '商户号',operate:false,formatter: function (value,row){
                        return row.merchant_name+'('+value+')';
                    }},
                    {field: 'create_time', title: '创建时间',  operate: 'RANGE', addclass: 'datetimerange', sortable: true, defaultValue:Moment().startOf('day').format('YYYY-MM-DD 00:00:00') + ' - ' + Moment().endOf('day').format('YYYY-MM-DD 23:59:59')},
                    {field: 'callback_time', title: '回调时间', operate: 'RANGE', addclass: 'datetimerange', sortable: true},
                    {field: 'money', title: '交易金额',operate:false},
                    {field: 'rate_money', title: '代付手续费（百分比+每笔）',operate:false},
                    {field: 'reduce_money', title: '扣款金额',operate:false},
                    
                    {
                        field: 'notify_status_type', 
                        title: '通知状态',
                        operate:false,
                        formatter: Table.api.formatter.label,
                        custom: {'未通知': 'info', '通知成功': 'success','通知失败':'default','异常':'warning'},
                    },
                    {
                        field: 'notify_status', 
                        title: '通知状态',
                        visible:false,
                        searchList: $.getJSON("order/payment/notifyList")
                    },
                ];
            }else{
                columns = [
                    {field: 'orderno', title: '平台订单号'},
                    {field: 'out_trade_no', title: '商户订单号'},
                    {field: 'tn', title: '三方订单号'},
                    {
                        field: 'channel_id', title: '代付通道',
                        formatter: function (value,row) {
                            return row.channel_name+'('+value+')';
                        },
                        searchList: $.getJSON("order/payment/colselect")
                    },
                    
                    {
                        field: 'status_type', 
                        title: '状态(上游)',
                        operate:false,
                        formatter: Table.api.formatter.label,
                        custom: {'待处理': 'info', '处理中': 'default','成功':'success','失败':'warning','下单失败':'danger'},
                    },
                    {
                        field: 'status', 
                        title: '状态(上游)',
                        visible:false,
                        searchList: Object.assign({},$.getJSON("order/payment/typeList"))
                    },

                    {field: 'merchant_number', title: '商户号',operate:false,formatter: function (value,row){
                        return row.merchant_name+'('+value+')';
                    }},
                    {
                        field: 'merchant_id', 
                        title: '商户',
                        visible:false,
                        searchList: $.getJSON("order/payment/merchantList")
                    },
                    {field: 'pay_type', title: '代付方式',operate:false},
                    {field: 'channel_type', title: '付款方式',operate:false},
                    {field: 'create_time', title: '创建时间',  operate: 'RANGE', addclass: 'datetimerange', sortable: true,defaultValue:Moment().startOf('day').format('YYYY-MM-DD 00:00:00') + ' - ' + Moment().endOf('day').format('YYYY-MM-DD 23:59:59')},
                    {field: 'callback_time', title: '回调时间', operate: 'RANGE', addclass: 'datetimerange', sortable: true},
                    {field: 'money', title: '交易金额',operate:false},
                    {field: 'rate_money', title: '代付手续费（百分比+每笔）',operate:false},
                    {field: 'reduce_money', title: '扣款金额',operate:false},
                    {field: 'rate_t_money', title: '上游手续费',operate:false},
                    
                    {
                        field: 'notify_status_type', 
                        title: '通知状态',
                        operate:false,
                        formatter: Table.api.formatter.label,
                        custom: {'未通知': 'info', '通知成功': 'success','通知失败':'default','异常':'warning'},
                    },
                    {
                        field: 'notify_status', 
                        title: '通知状态',
                        visible:false,
                        searchList: $.getJSON("order/payment/notifyList")
                    },
                    {
                        field: 'notify_number', 
                        title: '通知次数',
                        operate:false
                    },

                    {
                        field: 'operate',title: '操作',table: table,
                        events: Controller.api.events.operate, 
                        formatter: Controller.api.formatter.operate,
                        buttons: [
                            {
                                name: 'amount',
                                text: '查询',
                                icon: 'fa fa-primary',
                                classname: 'btn btn-xs btn-info btn-amount btn-dialog',
                                extend: 'data-toggle="tooltip" data-area=["100%","100%"]',
                                url: 'order/payment/detail',
                            },
                            {
                                name: 'notice',
                                text: '通知',
                                icon: 'fa fa-primary',
                                classname: 'btn btn-info btn-xs btn-notice',
                            },
                            {
                                name: 'reject',
                                text: '驳回',
                                icon: 'fa fa-info',
                                classname: 'btn btn-warning btn-xs btn-reject',
                            },
                        ],
                    }
                ];
                fixedRightNumber = 1;
            }

            var date = new Date();

            // 初始化表格
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                fixedColumns: true,
                fixedNumber: 0,
                fixedRightNumber: fixedRightNumber,
                //禁用默认搜索
                search: false,
                //启用普通表单搜索
                commonSearch: true,
                //可以控制是否默认显示搜索单表,false则隐藏,默认为false
                searchFormVisible: true,
                exportOptions: {
                    fileName: 'export_' + date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate(),
                    ignoreColumn: ['operate'], //默认不导出第一列(checkbox)与操作(operate)列
                },
                columns: [
                    columns
                ],
            });

            if(group_id == 1){
                // setInterval(function (){
                //     table.bootstrapTable('refresh',{silent: true });
                //     Layer.msg('刷新成功');

                // },1000*10);
            }

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
                    'click .btn-notice': function (e, value,row,index) {
                        var that = this;
                        var table = $(that).closest('table'); 
                        var options = table.bootstrapTable('getOptions');
                        var load = Layer.confirm('是否给下游商户重新发起一次回调', function (text, index) {
                            if($.trim(text)==''){
                                Layer.msg('不能为空');
                                return false
                            }

                            var ids = row['id'];

                            $.ajax({
                                type:"POST",
                                url:"order/payment/callback",
                                data:{
                                    id:ids,
                                },
                                dataType:"json",
                                success:function (data) {
                                    console.log(data);
                                    // layer.close(load)
                                    if(data.code == 1){
                                        Layer.msg(data.msg)
                                        // Layer.closeAll()
                                        $('.btn-refresh').trigger('click')
                                    }else{
                                        Layer.alert(data.msg, {icon: 5})
                                        $('.btn-refresh').trigger('click')
                                    }

                                }
                            })
                        })
                    },
                    'click .btn-reject': function (e, value,row,index) {
                        var that = this;
                        var table = $(that).closest('table'); 
                        var options = table.bootstrapTable('getOptions');

                        var load = Layer.confirm('是否驳回该订单，驳回后将回退<span style="color:red;">'+row.reduce_money+'</span>至商户代付余额', function (text, index) {
                            if($.trim(text)==''){
                                Layer.msg('不能为空');
                                return false
                            }

                            var ids = row['id'];

                            $.ajax({
                                type:"POST",
                                url:"order/payment/reject",
                                data:{
                                    id:ids,
                                },
                                dataType:"json",
                                success:function (data) {
                                    console.log(data);
                                    // layer.close(load)
                                    if(data.code == 1){
                                        Layer.msg(data.msg)
                                        // Layer.closeAll()
                                        $('.btn-refresh').trigger('click')
                                    }else{
                                        Layer.alert(data.msg, {icon: 5})
                                        $('.btn-refresh').trigger('click')
                                    }

                                }
                            })
                        })
                    },
                    
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
        }
    };
    return Controller;
});
