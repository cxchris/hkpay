define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {
    var Controller = {
        index: function () {
            // 初始化表格参数配置
            Table.api.init({
                extend: {
                    index_url: 'otc/pkg/index',
                    add_url: 'otc/pkg/add',
                    edit_url: 'otc/pkg/edit',
                    del_url: 'otc/pkg/del',
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
                        {field: 'id', title: 'id'},
                        {field: 'name', title: '银行名'},
                        {field: 'pkg', title: '包名'},
                        {field: 'regex', title: '正则表达式',operate:false},
                        {field: 'text', title: '例子'},
                        {
                            field: 'status', 
                            title: '状态', 
                            formatter: Table.api.formatter.status,
                            custom: {0: 'error', 1: 'success'},
                            searchList: {0: '关闭',1: '启用'}
                        },

                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, 
                            formatter: function (value, row, index) {
                                return Table.api.formatter.operate.call(this, value, row, index);
                            }
                        }
                        
                    ]
                ],
            });

            $('.regx').click(function(){
                layer.open({
                    type: 1,
                    skin: 'layui-layer-demo', //样式类名
                    area: ['400px', '400px'], //宽高
                    closeBtn: 1, //不显示关闭按钮
                    anim: 2,
                    title:'正则检验',
                    shadeClose: false, //开启遮罩关闭
                    content: _this.innerhtml(),
                    zIndex:99
                });
                _this.checkregx();
            })

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
        innerhtml: function(data){
            var content = '<form><div style="padding: 30px;" class="table-update">\
                    <div class="form-group">\
                        <label>正则表达式:</label>\
                        <input class="form-control regex" type="text" value="转账HKD\\s*(\\d+(\\.\\d+)?)" />\
                    </div>\
                    <div class="form-group">\
                        <label>检验字符串:</label>\
                        <textarea class="form-control string">LIU G******已转账HKD0.98至您的账户108-433XXX-XXX。按此查看详情。</textarea>\
                    </div>\
                    <div class="form-group">\
                        <label>提取结果:</label>\
                        <input class="form-control result" type="text" value="null" readonly />\
                    </div>\
                    <button type="button" class="btn btn-success check_submit">检测</button>\
                </div></form>';
            return content;

        },

        checkregx: function(){
            var _this = this;
            $('.check_submit').click(function(){
                let string = $('.string').val();
                let regex = $('.regex').val();

                let value = _this.matchAmount(string,regex);
                $('.result').val(value);
            })
        },

        matchAmount: function(content, regexString) {
            var _this = this;
            // console.log(content)
            let regex;

            try {
              // 可能引发异常的代码
              regex = new RegExp(regexString);
            } catch (error) {
              // 异常处理代码
              Layer.alert('Invalid regular', {icon: 5})
            }
            
            // console.log(regex)
            
            const match = content.match(regex);
            
            if (match) {
                return match[1];
            } else {
                return '未找到金额';
            }
        },
    };
    return Controller;
    
});
