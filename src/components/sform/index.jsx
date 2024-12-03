import './style.scss'
import { ref } from 'vue'
// 表单组件
import {
  ElForm as Form,
  ElFormItem as FormItem,
  ElRow as Row,
  ElCol as Col,
  ElCard as Card,
  ElButton as Button,
  ElSelect as Select,
  ElOption as Option,
  ElCascader as Cascader,
  ElInput as Input,
  ElRadio as Radio,
  ElRadioButton as RadioButton,
  ElRadioGroup as RadioGroup,
  ElCheckbox as Checkbox,
  ElCheckboxButton as CheckboxButton,
  ElCheckboxGroup as CheckboxGroup,
  ElSwitch as Switch,
  ElSlider as Slider,
  ElRate as Rate,
  ElDatePicker as DatePicker,
  ElUpload as Upload,
  ElInputNumber as InputNumber,
  ElAutocomplete as Autocomplete
} from 'element-plus'
// import { previewDoc, deleteDoc } from '/src/components/Office/office.js'
import Ellipsis from '../ellipsis/index.vue'
import { isEmpty, uuidv4 } from './util'
// import { UploadFilled } from '@element-plus/icons-vue'
// import { shallowRef } from 'vue'
export default {
  name: 'SForm',
  props: Object.assign({}, Form.props, {
    formItems: {
      type: Array,
      required: true
    },
    formData: {
      type: Object,
      default: () => {}
    },
    // 是否是查询表单
    search: {
      type: Boolean,
      default: false
    },
    // 是否是单列表单
    // single: {
    //   type: Boolean,
    //   default: false
    // },
    // 是否是表格表单
    formTable: {
      type: Boolean,
      default: false
    },
    // 表格表单标题
    formTitle: {
      type: String,
      default: ''
    },
    // 表单项属性，暂无用
    formItemProps: {
      type: Object,
      default: () => {}
    },
    // 底部是否有确认取消按钮
    ok: {
      type: Boolean,
      default: false
    },
    // 底部确定按钮文本
    okText: {
      type: String,
      default: 'OK'
    },
    // 取消文字
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    // 默认输入提示
    defaultPlaceholderInput: {
      type: String,
      default: 'Enter'
    },
    // 默认选择提示
    defaultPlaceholderSelect: {
      type: String,
      default: 'Select'
    },
    // 无数据提示
    defaultTipsNoData: {
      type: String,
      default: 'No data'
    },
    // 上传选择文件提示
    defaultTipsUpload: {
      type: String,
      default: 'Select the file'
    },
    // 是否有提交申请按钮
    hasApplyBtn: {
      type: Boolean,
      default: false
    },
    // 底部提交申请按钮文本
    applyBtnText: {
      type: String,
      default: '提交申请'
    },
    // 是否有row和col布局
    noRowCol: {
      type: Boolean,
      default: false
    },
    // 表单标签文本长度
    labelTextLength: {
      type: [Number, String],
      default: 12
    },
    accessToken: {
      type: String,
      default: ''
    },
    lang: {
      type: String,
      default: 'zh-CN'
    }
    // 查询字典keys
    // queryDictKeys: {
    //   type: Array,
    //   default: () => []
    // }
  }),
  setup() {
    const ruleFormRef = ref(null)
    function render() {
      return (
        <div>
          {/* 头部 */}
          {this.$slots.header?.()}
          {/* 表单内容 */}
          {this.formTable ? this.renderFormModelTable(ruleFormRef) : this.renderFormModel(ruleFormRef)}
          {/* 是否有确定按钮 */}
          {this.ok ? (
            <div class="bottom-control">
              <Button
                type="primary"
                size="large"
                loading={this.saveBtnLoading}
                onClick={async (event) => {
                  event.stopPropagation()
                  await ruleFormRef.value.validate((valid) => {
                    if (valid) {
                      this.saveBtnLoading = true
                      this.$emit('submit', this.formData)
                      setTimeout(() => {
                        this.saveBtnLoading = false
                      }, 2000)
                    } else {
                      return false
                    }
                  })
                }}
              >
                {this.okText}
              </Button>
              {this.hasApplyBtn ? (
                <Button
                  type="primary"
                  size="large"
                  plain
                  loading={this.loading}
                  onClick={async (event) => {
                    event.stopPropagation()
                    await ruleFormRef.value.validate((valid) => {
                      if (valid) {
                        this.loading = true
                        this.$emit('apply', this.formData)
                        setTimeout(() => {
                          this.loading = false
                        }, 2000)
                      } else {
                        return false
                      }
                    })
                  }}
                >
                  {this.applyBtnText}
                </Button>
              ) : null}
              <Button
                size="large"
                onClick={(event) => {
                  event.stopPropagation()
                  this.$emit('cancel')
                }}
              >
                {this.cancelText}
              </Button>
            </div>
          ) : (
            ''
          )}
          {/* 尾部 */}
          {this.$slots.footer?.()}
        </div>
      )
    }
    return {
      ruleFormRef,
      render
    }
  },
  data() {
    return {
      // UploadFilled: shallowRef(UploadFilled),
      // 高级搜索 展开/关闭
      advanced: true,
      // 字典映射存储
      dictMap: {},
      saveBtnLoading: false,
      loading: false
    }
  },
  computed: {
    // render映射
    renderMap() {
      return {
        text: this.renderText,
        input: this.renderInput,
        inputNumber: this.renderInputNumber,
        select: this.renderSelect,
        cascader: this.renderCascader,
        radio: this.renderRadio,
        checkbox: this.renderCheckbox,
        switch: this.renderSwitch,
        slider: this.renderSlider,
        rate: this.renderRate,
        datePicker: this.renderDatePicker,
        upload: this.renderUpload,
        // treeSelect: this.renderTreeSelect,
        autoComplete: this.renderAutoComplete,
        custom: this.renderCustom
      }
    }
  },
  created() {
    // 查询字典
    // if (!isEmpty(this.queryDictKeys)) {
    //   this.queryDictKeys.forEach((key) => {
    //     this.getDicts(key).then((res) => {
    //       this.$set(this.dictMap, key, res.data)
    //     })
    //   })
    // }
  },
  methods: {
    // 自定义组件
    renderCustom(item) {
      return item.render(item)
    },
    // 文本
    renderText(item) {
      return (
        <span class="text" {...item.compProps}>
          {item.formatter instanceof Function ? item.formatter(this.formData[item['prop']]) : this.formData[item['prop']]}
        </span>
      )
    },
    // 输入
    renderInputItem(item) {
      return (
        <Input
          vModel={this.formData[item['prop']]}
          defaultValue={item['defaultValue']}
          placeholder={!isEmpty(item.placeholder) ? item.placeholder : this.defaultPlaceholderInput}
          style={{ width: '100%' }}
          onKeyup={(e) => {
            if (e.keyCode === 13 && this.search) {
              this.handleSearch()
            }
          }}
          onBlur={item.compProps && item.compProps.clear ? (val) => item.compProps.blur(val) : ''}
          onClear={item.compProps && item.compProps.clear ? () => item.compProps.clear() : ''}
          show-word-limit={item.compProps ? (item.compProps.props ? item.compProps.props.showWordLimit : false) : false}
          maxlength={item.compProps ? (item.compProps.props ? item.compProps.props.maxlength : null) : null}
          minlength={item.compProps ? (item.compProps.props ? item.compProps.props.minlength : null) : null}
          {...item.compProps}
        />
      )
    },
    renderInput(item) {
      return item.renderSuffix instanceof Function ? (
        <div style={item.renderSuffixStyle || 'display:flex'}>
          {this.renderInputItem(item)}
          {item.renderSuffix(this.formData[item['prop']], this.formData)}
        </div>
      ) : (
        this.renderInputItem(item)
      )
    },
    // 输入
    renderInputNumber(item) {
      return (
        <InputNumber
          class="text"
          vModel={this.formData[item['prop']]}
          placeholder={this.defaultPlaceholderInput}
          style={{ width: '100%' }}
          {...item.compProps}
        />
      )
    },
    renderSelectItem(item, ops) {
      return (
        <Select
          vModel={this.formData[item['prop']]}
          placeholder={this.defaultPlaceholderSelect}
          noDataText={this.defaultTipsNoData}
          style={{ width: this.$props.inline ? '200px' : '100%' }}
          filterOption={(inputValue, option) => {
            return option.componentOptions.children[0].text.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
          }}
          clearable={item.allowClear}
          {...item.compProps}
        >
          {ops.map((op, opIndex) => {
            return (
              <Option
                key={op[item['valueAlias'] || 'dictValue']}
                value={op[item['valueAlias'] || 'dictValue']}
                label={op[item['labelAlias'] || 'dictLabel']}
                disabled={op[item['disabledAlias'] || 'dictDisabled']}
              >
                {op[item['labelAlias'] || 'dictLabel']}
              </Option>
            )
          })}
        </Select>
      )
    },
    // 选择
    renderSelect(item) {
      const ops = this.getOptions(item)
      if (!ops) return <span>请添加选项</span>
      return item.renderSuffix instanceof Function ? (
        <div style={item.renderSuffixStyle || 'display:flex'}>
          {this.renderSelectItem(item, ops)}
          {item.renderSuffix(this.formData[item['prop']], this.formData)}
        </div>
      ) : (
        this.renderSelectItem(item, ops)
      )
    },
    // 级联选择器
    renderCascader(item) {
      const ops = this.getOptions(item)
      if (!ops) return <span>请添加选项</span>
      return <Cascader style={{ width: '100%' }} vModel={this.formData[item['prop']]} {...item.compProps} />
    },
    // 单选框
    renderRadio(item) {
      const ops = this.getOptions(item)
      if (!ops) return <span>请添加选项</span>
      return (
        <RadioGroup vModel={this.formData[item['prop']]} {...item.compProps}>
          {ops.map((op) => {
            return item.button ? (
              <RadioButton label={op[item['valueAlias'] || 'dictValue']} value={op[item['valueAlias'] || 'dictValue']}>
                {op[item['labelAlias'] || 'dictLabel']}
              </RadioButton>
            ) : (
              <Radio label={op[item['valueAlias'] || 'dictValue']} value={op[item['valueAlias'] || 'dictValue']}>
                {op[item['labelAlias'] || 'dictLabel']}
              </Radio>
            )
          })}
        </RadioGroup>
      )
    },
    // 多选框
    renderCheckbox(item) {
      const ops = this.getOptions(item)
      if (!ops) return <span>请添加选项</span>
      return (
        <CheckboxGroup vModel={this.formData[item['prop']]} {...item.compProps}>
          {ops.map((op) => {
            return item.button ? (
              <CheckboxButton
                label={op[item['valueAlias'] || 'dictValue']}
                value={op[item['valueAlias'] || 'dictValue']}
              >
                {op[item['labelAlias'] || 'dictLabel']}
              </CheckboxButton>
            ) : (
              <Checkbox label={op[item['valueAlias'] || 'dictValue']} value={op[item['valueAlias'] || 'dictValue']}>
                {op[item['labelAlias'] || 'dictLabel']}
              </Checkbox>
            )
          })}
        </CheckboxGroup>
      )
    },
    // 开关
    renderSwitch(item) {
      return <Switch vModel={this.formData[item['prop']]} {...item.compProps} />
    },
    // 滑块
    renderSlider(item) {
      return <Slider vModel={this.formData[item['prop']]} {...item.compProps} />
    },
    // 评分
    renderRate(item) {
      return <Rate vModel={this.formData[item['prop']]} {...item.compProps} />
    },
    // 日期选择
    renderDatePicker(item) {
      return (
        <DatePicker
          vModel={this.formData[item['prop']]}
          style={{ width: '100%' }}
          placeholder="请选择日期"
          {...item.compProps}
        />
      )
    },
    // 文件上传
    renderUpload(item) {
      const uploadRef = ref(null)
      return (
        <Upload
          width="100%"
          ref={uploadRef}
          style={item.style}
          {...{
            drag: item.dragger,
            headers: { Authorization: 'Bearer ' + this.accessToken, lang: this.lang },
            action: '/api/common/upload',
            fileList: this.getUploadDefaultFileList(item),
            onChange: (file, fileList) => this.handleUploadChange(file, fileList, item),
            onError: this.handleUploadError,
            // onPreview: this.handleUploadPreview,
            // beforeRemove: this.handleUploadBeforeRemove,
            ...item.compProps
          }}
          v-slots={{
            tip: () => (
              <div class="el-upload__tip" style={{ fontSize: '14px' }}>
                {item.uploadTips()}{' '}
              </div>
            ),
            default: () => {
              return item.renderUpload instanceof Function ? (
                item.renderUpload(item)
              ) : item.dragger && item.uploadText instanceof Function ? (
                <div>
                  {/* <i class="el-icon-upload" /> */}
                  {/* elementPlus */}
                  {/* <el-icon class="el-icon--upload"> */}
                  {/*  <UploadFilled /> */}
                  {/* </el-icon> */}
                  <div class="el-upload__text">{item.uploadText()}</div>
                </div>
              ) : (
                <Button type="primary" plain icon="el-icon-upload">
                  {this.defaultTipsUpload}
                </Button>
              )
            }
          }}
        ></Upload>
      )
    },
    // 树选择
    // renderTreeSelectItem(item, ops) {
    //   return (
    //     <TreeSelect
    //       vModel={this.formData[item['prop']]}
    //       treeData={ops}
    //       replaceFields={{ title: item['titleAlias'], key: item['keyAlias'], value: item['valueAlias'] }}
    //       placeholder="请选择"
    //       show-search
    //       allow-clear
    //       filterTreeNode={(inputValue, treeNode) => {
    //         return treeNode.data.props.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
    //       }}
    //       {...item.compProps}
    //     ></TreeSelect>
    //   )
    // },
    renderTreeSelect(item) {
      const ops = this.getOptions(item)
      if (!ops) return <span>请添加选项</span>
      return item.renderSuffix instanceof Function ? (
        <div style={item.renderSuffixStyle || 'display:flex'}>
          {this.renderTreeSelectItem(item, ops)}
          {item.renderSuffix(this.formData[item['prop']], this.formData)}
        </div>
      ) : (
        this.renderTreeSelectItem(item, ops)
      )
    },
    // 自动输入
    renderAutoComplete(item) {
      const ops = this.getOptions(item)
      if (!ops) return <span>请添加选项</span>
      return (
        <Autocomplete
          dataSource={ops}
          vModel={this.formData[item['prop']]}
          placeholder="请选择或输入"
          filterOption={(inputValue, option) => {
            return option.componentOptions.children[0].text.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
          }}
          {...item.compProps}
        />
      )
    },
    // 获取选项
    getOptions(item) {
      // 常量选项
      let ops = item['options']
      if (!ops) {
        return null
      }
      // 获取查询字典映射
      if (typeof ops === 'string') {
        ops = this.dictMap[ops] || []
      } else if (ops instanceof Function) {
        // 函数获取选项
        ops = ops(item)
      }
      return ops
    },
    handleUploadError(err, file, fileList) {
      console.log(err)
      this.$message.error(err)
    },
    handleUploadChange(file, fileList, item) {
      // console.log('handleUploadChange', file, fileList, item)
      if (file.status !== 'success') {
        return
      }
      if (file.response && file.response.status !== 200) {
        return this.$message.error(file.response.message)
      }
      if (item.handleChange instanceof Function) {
        item.handleChange(file, fileList, item)
      }
    },
    handleUploadPreview(file) {
      if (file.response) {
        if (file.status === 'done' && file.response.code === 200) {
          // previewDoc(file.name, file.response.fileName)
        }
      } else {
        // previewDoc(file.name, file.url)
      }
    },
    handleUploadBeforeRemove(file) {
      return new Promise((resolve, reject) => {
        this.$confirm('是否删除附件：' + file.name + '?').then(() => {
          // const fileName = file.response ? file.response.fileName : file.url
          // // deleteDoc(fileName)
          //   .then(() => {
          //     this.$message.success('删除成功')
          //     resolve(true)
          //   })
          //   .catch((err) => {
          //     this.$message.error('删除失败')
          //     reject(err)
          //   })
        })
      })
    },
    getUploadDefaultFileList(item) {
      if (item && item.customDefaultFileList instanceof Function) {
        const fileList = item.customDefaultFileList()
        if (!isEmpty(fileList)) {
          fileList.forEach((item) => {
            item.uid = uuidv4()
          })
        }
        console.log('defaultFileList', fileList)
        return fileList
      }
      // 这里改出问题了
      // if (!this.isEmpty(this.$refs.upload) && this.isEmpty(this.$refs.upload.sFileList)) {
      // if (!this.isEmpty(fileList) && !this.isEmpty(this.$refs.upload)) {
      //   this.$refs.upload.sFileList = fileList
      // }
    },
    // 查询表单：查询、重置
    renderSearch() {
      return (
        <Col md={(!this.advanced && 8) || 24} sm={24}>
          <span style={(this.advanced && { float: 'right', overflow: 'hidden' }) || {}}>
            <Button type="primary" size="small" plain icon="el-icon-search" onClick={() => this.handleSearch()}>
              查询
            </Button>
            <Button size="small" icon="el-icon-refresh-left" onClick={() => this.$emit('reset')}>
              重置
            </Button>
            {this.formItems.length > 2 ? (
              <a onClick={() => (this.advanced = !this.advanced)} style="margin-left: 8px; font-size: 14px;">
                {this.advanced ? '收起' : '展开'}
                <i class={this.advanced ? 'el-icon-arrow-up' : 'el-icon-arrow-down'} />
              </a>
            ) : (
              ''
            )}
          </span>
        </Col>
      )
    },
    // 查询表单
    renderSearchForm() {
      // 前2个显示，advanced=true（即展开时）后面的都显示
      const showItems = this.formItems.map((item, i) => {
        return i < 2 || this.advanced ? (
          <Col key={i} md={8} sm={24}>
            <FormItem class="sform-form-item" size="default" label={item['label']} prop={item['prop']}>
              {this.renderMap[item['type']] instanceof Function ? this.renderMap[item['type']](item) : '配置项不正确'}
            </FormItem>
          </Col>
        ) : (
          ''
        )
      })
      showItems.push(this.renderSearch())
      return showItems
    },
    // 获取span大小
    getSpanSize(rowItems) {
      // 向上取整
      return Math.ceil(24 / rowItems.length)
    },
    // 渲染表单项
    renderFormItem(item) {
      // const labelCol = single ? { lg: 6, md: 8, sm: 10, xs: 24 } : null
      // const wrapperCol = single ? { lg: 18, md: 16, sm: 14, xs: 24 } : null
      return (
        <FormItem
          size="default"
          class={this.noRowCol ? 'sform-no-rowcol-item' : 'sform-form-item'}
          // labelCol={labelCol}
          // wrapperCol={wrapperCol}
          // label={item['label']}
          prop={item['prop']}
          {...item.formItemProps}
          v-slots={{
            default: () => (this.renderMap[item['type']] instanceof Function ? this.renderMap[item['type']](item) : ''),
            label: () => (item.label instanceof Function ? item.label() : <Ellipsis length={Number(this.$props.labelTextLength)}>{item.label}</Ellipsis>)
          }}
        ></FormItem>
      )
    },
    // Form
    renderFormModel(ruleFormRef) {
      const { noRowCol, search, formItems, formData, ...props } = this.$props
      return (
        <Form ref={ruleFormRef} {...{ size: 'default', inline: true, ...props }} model={formData}>
          {!search ? (
            formItems.map((subItems) => {
              return noRowCol ? (
                this.renderFormItem(subItems)
              ) : (
                <Row gutter={48}>
                  {subItems.map((item) => {
                    return (
                      <Col
                        lg={{ span: this.getSpanSize(subItems) }}
                        md={{ span: this.getSpanSize(subItems) }}
                        sm={24}
                        xs={24}
                      >
                        {this.renderFormItem(item)}
                      </Col>
                    )
                  })}
                </Row>
              )
            })
          ) : (
            <Row gutter={48}>{this.renderSearchForm()}</Row>
          )}
        </Form>
      )
    },
    // 表单搜索
    handleSearch() {
      this.$emit('search')
    },
    // 表格表单
    renderFormModelTable(ruleFormRef) {
      const { formTitle, formItems, formData, ...props } = this.$props
      return (
        <Form ref={ruleFormRef} size="small" props={{ ...props, model: formData }}>
          <Card class="table-card">
            <span class="documentsIssuedTitle">{formTitle}</span>
            {/* 表格头部（标题下） */}
            {this.$slots.theader?.()}
            {/* 表格卡片表单 */}
            <table border="1px" class="documentsIssueTable">
              {formItems.map((subItems, formIndex) => {
                return (
                  <tr key={`formItem${formIndex}`}>
                    {subItems.map((item, subIndex) => {
                      return item.render instanceof Function
                        ? item.render(item)
                        : [1, 2].map((i) => {
                            return i === 1 ? (
                              <td key={`subItem1${formIndex}${subIndex}`} class="firstTr">
                                {item['label']}
                              </td>
                            ) : (
                              <td key={`subItem2${formIndex}${subIndex}`} colspan={item.colspan || 2} class="firstTr">
                                <FormItem
                                  size="default"
                                  key={`subItemFormModelItem${formIndex}${subIndex}`}
                                  prop={item['prop']}
                                >
                                  {this.renderMap[item['type']] instanceof Function
                                    ? this.renderMap[item['type']](item, `subItemFormModelItem${formIndex}${subIndex}`)
                                    : '配置项不正确'}
                                </FormItem>
                              </td>
                            )
                          })
                    })}
                  </tr>
                )
              })}
            </table>
            {/* 表格尾部 */}
            {this.$slots.tfooter?.()}
          </Card>
        </Form>
      )
    },
    // 表单校验
    validateForm(callbackFunc) {
      if (!this.ruleFormRef) return
      this.ruleFormRef.validate((valid, fields) => {
        if (valid && callbackFunc instanceof Function) {
          callbackFunc(fields)
        }
      })
    },
    // 清空校验
    clearValidateForm(params) {
      if (!this.ruleFormRef) return
      this.ruleFormRef.clearValidate(params)
    }
  },
  render() {
    return this.render()
  }
}
