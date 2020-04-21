<template>
  <div id="app">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
    >
      <el-menu-item index="1">在线人物关系图谱生成</el-menu-item>
      <el-submenu index="2">
        <template slot="title">配置</template>
        <el-menu-item index="2-1" @click="settingRole">设置人物</el-menu-item>
        <el-menu-item index="2-2" @click="settingRoleRes"
          >配置关系</el-menu-item
        >
      </el-submenu>
      <el-submenu index="3">
        <template slot="title">导出</template>
        <el-menu-item @click="exportImg" index="3-1">导出图片</el-menu-item>
      </el-submenu>
      <el-menu-item index="5" @click="initRes">还原</el-menu-item>
      <el-menu-item index="4"
        ><a
          href="https://github.com/cute-angelia/relation-chart"
          target="_blank"
          >Github Star</a
        ></el-menu-item
      >
    </el-menu>

    <div class="line"></div>

    <div id="map" ref="map" style="width: 1280px;height: 1000px;"></div>

    <el-dialog title="创建人物" :visible.sync="dialogRole.visible">
      <el-form :model="dialogRole.form" label-width="100px">
        <el-form-item label="人物名称">
          <el-input
            v-model="dialogRole.form.name"
            autocomplete="off"
            @blur="convertPy(dialogRole.form.name)"
          ></el-input>
        </el-form-item>
        <el-form-item label="头像地址">
          <el-input
            v-model="dialogRole.form.avatar"
            autocomplete="off"
            placeholder="http://"
          ></el-input>
        </el-form-item>
        <el-form-item label="人物简称">
          <el-input
            v-model="dialogRole.form.role_id"
            autocomplete="off"
            placeholder="英文, 如重复后加数字，建议名字拼音"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-select
          v-model="currentRole"
          placeholder="当前已存在人物, 选中修改"
          filterable
          clearable
          @change="editCurrentRole"
        >
          <el-option
            v-for="(item, i) in rdata.nodes"
            :key="i"
            :label="item.name"
            :value="item.role_id"
          >
            <span style="float: left">{{ item.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{
              item.role_id
            }}</span>
          </el-option>
        </el-select>
        &nbsp;&nbsp;
        <el-button @click="resetDialog">清 空</el-button>
        &nbsp;&nbsp;
        <el-popconfirm
          v-if="currentRole"
          confirmButtonText="好的"
          cancelButtonText="不用了"
          icon="el-icon-info"
          iconColor="red"
          title="确定修改吗？"
          @onConfirm="handlerSaveDialogRole"
        >
          <el-button slot="reference" type="primary">保 存</el-button>
        </el-popconfirm>

        <el-button
          v-else
          slot="reference"
          type="primary"
          @click="handlerSaveDialogRole"
          >保 存</el-button
        >
      </div>
    </el-dialog>

    <!-- 关系 -->
    <el-dialog title="创建人物关系" :visible.sync="dialogRoleRes.visible">
      <el-form :model="dialogRoleRes.form" label-width="100px">
        <el-form-item label="人物一">
          <el-select
            style="width:250px;"
            v-model="dialogRoleRes.form.source"
            placeholder="人物一"
            filterable
            clearable
          >
            <el-option
              v-for="(item, i) in rdata.nodes"
              :key="i"
              :label="item.name"
              :value="item.role_id"
            >
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{
                item.role_id
              }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="人物二">
          <el-select
            style="width:250px;"
            v-model="dialogRoleRes.form.target"
            placeholder="人物二"
            filterable
            clearable
          >
            <el-option
              v-for="(item, i) in rdata.nodes"
              :key="i"
              :label="item.name"
              :value="item.role_id"
            >
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{
                item.role_id
              }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关系">
          <el-select
            style="width:250px;"
            v-model="dialogRoleRes.form.relation"
            clearable
            filterable
            allow-create
          >
            <el-option
              v-for="(item, i) in relations"
              :key="i"
              :label="item"
              :value="item"
            >
            </el-option>
          </el-select>
          &nbsp;&nbsp;<a
            target="_blank"
            href="http://passer-by.com/relationship/"
            >关系计算器</a
          >
        </el-form-item>
        <el-form-item label="线条颜色"
          ><el-color-picker
            style="top: 1px;"
            v-model="dialogRoleRes.form.color"
          ></el-color-picker>
          &nbsp; &nbsp;
          <el-input
            style="width:200px;"
            v-model="dialogRoleRes.form.color"
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-select
          style="width:250px;"
          v-model="currentRoleRes"
          placeholder="当前已存在人物关系, 选中修改"
          filterable
          @change="editCurrentRoleRes"
        >
          <el-option
            v-for="(item, i) in rdata.relations"
            :key="i"
            :label="
              getRoleNameByRoleId(item.source) +
                '-' +
                getRoleNameByRoleId(item.target)
            "
            :value="i"
          >
            <span style="float: left">{{
              getRoleNameByRoleId(item.source) +
                '-' +
                getRoleNameByRoleId(item.target)
            }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{
              item.relation
            }}</span>
          </el-option>
        </el-select>
        &nbsp;&nbsp;
        <el-button @click="resetDialogRes">清 空</el-button>
        &nbsp;&nbsp;
        <el-popconfirm
          v-if="currentRoleResExits"
          confirmButtonText="好的"
          cancelButtonText="不用了"
          icon="el-icon-info"
          iconColor="red"
          title="确定修改吗？"
          @onConfirm="handlerSaveDialogRoleRes"
        >
          <el-button slot="reference" type="primary">保 存</el-button>
        </el-popconfirm>

        <el-button
          v-else
          slot="reference"
          type="primary"
          @click="handlerSaveDialogRoleRes"
          >保 存</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import RelationChart from './lib/chat'
  //import { covertSVG2Image } from './lib/exportimg'
  import { saveSvgAsPng } from 'save-svg-as-png'
  import pinyin from 'js-pinyin'
  pinyin.setOptions({ checkPolyphone: false, charCase: 1 })

  export default {
    name: 'App',
    data() {
      return {
        currentRoleResExits: false,
        relations: [
          '情人',
          '朋友',
          '兄弟',
          '姐姐',
          '妹妹',
          '母亲',
          '父亲',
          '老爷',
          '仆人',
          '叔父',
          '姑妈',
          '舅父',
          '舅舅',
          '堂弟',
          '爷爷',
          '奶奶',
          '儿婿',
          '孙媳妇',
          '姨父',
          '表兄弟',
          '太奶奶',
          '太爷爷',
        ],
        currentRole: {},
        currentRoleRes: {},
        relationChart: null,
        activeIndex: '1',
        dialogRole: {
          visible: false,
          form: {
            name: '',
            role_id: '',
            avatar: '',
          },
        },
        dialogRoleRes: {
          visible: false,
          form: {
            source: '',
            target: '',
            relation: '',
            color: '#CF3C51',
          },
        },
        rdata: {
          nodes: [
            {
              name: '路人甲1',
              role_id: 'lurenjia1',
              avatar:
                'http://best-ecology.oss-cn-hangzhou.aliyuncs.com/knowleage/avatar/2/1586758771776776.jpg',
            },
            {
              name: '路人乙2',
              role_id: 'lurenjia2',
              avatar:
                'http://best-ecology.oss-cn-hangzhou.aliyuncs.com/knowleage/avatar/2/1586758771776776.jpg',
            },
            {
              name: '路人丙3',
              role_id: 'lurenjia3',
              avatar:
                'http://best-ecology.oss-cn-hangzhou.aliyuncs.com/knowleage/avatar/2/1586758771776776.jpg',
            },
          ],
          relations: [
            {
              source: 'lurenjia1',
              target: 'lurenjia2',
              relation: '爱人仇人',
              color: '#CF3C51',
            },
            {
              source: 'lurenjia2',
              target: 'lurenjia3',
              relation: '女朋友',
              color: '#CF3C51',
            },
          ],
          // links: [
          //   {
          //     source: 0,
          //     target: 1,
          //     relation: '朋友',
          //     color: 'CF3C51',
          //   },
          //   {
          //     source: 1,
          //     target: 2,
          //     relation: '女朋友',
          //     color: 'CF3C51',
          //   },
          // ],
        },
      }
    },
    methods: {
      getRoleNameByRoleId(role_id) {
        var role = this.choiceRoleByRoleId(role_id)
        return role.name
      },
      editCurrentRole(val) {
        var role = this.choiceRoleByRoleId(val)
        this.dialogRole.form = role
      },
      editCurrentRoleRes(index) {
        this.currentRoleResExits = true
        var res = this.choiceRoleResByIndex(index)
        this.dialogRoleRes.form = res
      },
      handleSelect(key, keyPath) {
        console.log(key, keyPath)
      },
      // 初始化
      initRes() {
        if (this.$refs) {
          this.relationChart = new RelationChart(this.$refs.map, this.rdata)
        }
      },
      settingRole() {
        this.dialogRole.visible = true
      },
      settingRoleRes() {
        this.dialogRoleRes.visible = true
      },
      convertPy(val) {
        this.dialogRole.form.role_id = pinyin.getFullChars(val)
      },
      // 根据 roleid 选择 role
      choiceRoleResByIndex(index) {
        var obj = {}
        var rdata = this.rdata
        obj = rdata.relations[index]
        return obj
      },
      choiceRoleByRoleId(role_id) {
        var obj = {}
        var rdata = this.rdata
        for (let i = 0; i < rdata.nodes.length; i++) {
          const element = rdata.nodes[i]
          if (role_id == element.role_id) {
            obj = element
            break
          }
        }
        return obj
      },
      resetDialog() {
        this.dialogRole.form = {
          name: '',
          role_id: '',
          avatar: '',
        }
      },
      resetDialogRes() {
        this.dialogRoleRes.form = {
          source: '',
          target: '',
          relation: '',
          color: '#CF3C51',
        }
      },
      handlerSaveDialogRole() {
        var temp = this.dialogRole.form
        var rdata = this.rdata
        var thiz = this

        var isExits = false
        for (let i = 0; i < rdata.nodes.length; i++) {
          const element = rdata.nodes[i]
          if (temp.name == element.name) {
            // thiz.$alert('已存在相同名称: ' + element.name, '名称重复')

            rdata.nodes[i] = temp
            thiz.$alert('修改成功')

            isExits = true
            break
          }
        }

        if (isExits === false) {
          thiz.rdata.nodes.push(temp)
        }
        this.initRes()
        this.resetDialog()

        this.saveLocal()
      },
      handlerSaveDialogRoleRes() {
        this.currentRoleResExits = false
        var temp = this.dialogRoleRes.form
        var rdata = this.rdata
        var thiz = this

        var isExits = false
        for (let i = 0; i < rdata.relations.length; i++) {
          const element = rdata.relations[i]
          console.log(temp, element)
          if (temp.source == element.source && temp.target == element.target) {
            this.currentRoleResExits = true
            // thiz.$alert('已存在相同名称: ' + element.name, '名称重复')

            rdata.relations[i] = temp
            thiz.$alert('修改成功')

            isExits = true
            break
          }
        }

        if (isExits === false) {
          thiz.rdata.relations.push(temp)
        }

        this.initRes()
        this.resetDialogRes()
        this.saveLocal()
      },
      saveLocal() {
        localStorage['config_res'] = JSON.stringify(this.rdata)
      },
      getLocal() {
        if (
          localStorage['config_res'] &&
          localStorage['config_res'].length > 10
        ) {
          this.rdata = JSON.parse(localStorage['config_res'])
        }
      },
      exportImg() {
        saveSvgAsPng(
          document.querySelectorAll('#map svg')[0],
          'relation-chart.png'
        )
      },
    },
    mounted() {
      this.getLocal()
      this.initRes()
    },
  }
</script>
