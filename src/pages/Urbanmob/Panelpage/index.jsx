
import React, { useState, useCallback } from 'react'
import { Tabs, Layout, Button, Menu } from 'antd';
import Areapowerload from '../Areapowerload';
import Visualcamera from '../Visualcamera';
import Chargeheatmap from '../Chargeheatmap';
import Chargestation from '../Chargestation';
import {
  SettingOutlined,
  MenuUnfoldOutlined, MenuFoldOutlined, NodeIndexOutlined
} from '@ant-design/icons';
import './index.css';
//redux
import { useDispatch, useMappedState } from 'redux-react-hook'
import {
  setactivepage_tmp
} from '@/redux/actions/evdata'
const { TabPane } = Tabs;
const { SubMenu } = Menu;
const { Sider, Content } = Layout;

export default function Panelpage() {

  /*
    ---------------redux中取出变量---------------
  */
  //#region
  const mapState = useCallback(
    state => ({
      evdata: state.evdata
    }),
    []
  );
  const { evdata } = useMappedState(mapState);
  const { activepage } = evdata
  const dispatch = useDispatch()
  const setactivepage = (data) => {
    dispatch(setactivepage_tmp(data))
  }

  //定义Hooks
  const [collapsed, setCollapsed] = useState(true);

  //缩小sidebar
  function toggleCollapsed() {
    setCollapsed(!collapsed);
  };


  function handleClick(e) {
    setactivepage(e.key)
  }
  const menu = (<Sider
    collapsed={collapsed}
    onCollapse={toggleCollapsed}
    theme='light'
  >
    <Menu
      mode="inline"
      onClick={handleClick}
      defaultSelectedKeys={['Areapowerload']}
      style={{
        borderRight: 0,
        'overflowX': 'hidden',
        'overflowY': 'auto'
      }}
    >
      <SubMenu key="sub1_1" icon={<span className="iconfont icon-lineplot" />} title="区域充电需求时变">
        <Menu.Item key="Areapowerload" icon={<span className="iconfont icon-lineplot" />}>区域充电需求时变</Menu.Item>


      </SubMenu>
      <SubMenu key="sub1_2" icon={<span className="iconfont icon-heatmap" />} title="充电需求热力图">

        <Menu.Item key="Chargeheatmap" icon={<span className="iconfont icon-heatmap" />}>充电需求热力图</Menu.Item>


      </SubMenu>
      <SubMenu key="sub1_3" icon={<span className="iconfont icon-charge" />} title="充电站供需分析">

        <Menu.Item key="Chargestation" icon={<span className="iconfont icon-charge" />}>充电站供需分析</Menu.Item>

      </SubMenu>

      <SubMenu key="sub2" icon={<SettingOutlined />} title="设置">
        <Menu.Item key="Visualcamera" icon={<span className="iconfont icon-vedio" />}>视角设置</Menu.Item>
      </SubMenu>
    </Menu>
    <Button type="text" onClick={toggleCollapsed} style={{ margin: '10px 16px' }}>
      {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)}
    </Button>
  </Sider>

  )


  return (
    <Layout>
      <Content>
        <Tabs tabPosition="left" size='small' renderTabBar={(a, b) => menu} activeKey={activepage}>
          <TabPane key="Areapowerload" >
            <Areapowerload />
          </TabPane>
          <TabPane key="Chargeheatmap" >
            <Chargeheatmap />
          </TabPane>
          <TabPane key="Chargestation" >
            <Chargestation />
          </TabPane>
          <TabPane key="Visualcamera" >
            <Visualcamera />
          </TabPane>
        </Tabs>
      </Content>
    </Layout>


  )

}
