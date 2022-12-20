import React, {  useState } from 'react'

import { PageHeader, Menu, Dropdown, Button } from 'antd';
import { DownOutlined, SettingOutlined, UpOutlined, GlobalOutlined } from '@ant-design/icons';
import { publish } from 'pubsub-js';
import './index.css';

  
const { SubMenu } = Menu;

export default function Header(props) {

    //定义Hooks
    const [collapsed, setCollapsed] = useState(true);
    //缩小sidebar
    function toggleCollapsed() {
        setCollapsed(!collapsed);
        //导航至页面
        publish('showpanel', !collapsed)
    };
    const menu = (<Menu>
        <SubMenu key='Mapstyle' title="地图样式" icon={<GlobalOutlined />}>
            <Menu.Item key="dark" onClick={() => { publish('mapstyle', "dark-v10") }}>黑色</Menu.Item>
            <Menu.Item key="light" onClick={() => { publish('mapstyle', "light-v10") }}>白色</Menu.Item>
            <Menu.Item key="satellite" onClick={() => { publish('mapstyle', "satellite-v9") }}>卫星</Menu.Item>
            <Menu.Item key="streets" onClick={() => { publish('mapstyle', "streets-v10") }}>街道</Menu.Item>
            <Menu.Item key="outdoors" onClick={() => { publish('mapstyle', "outdoors-v10") }}>户外</Menu.Item>
        </SubMenu>
    </Menu>
    );

    return (
        <>
            {collapsed ? <PageHeader
                className="site-page-header"
                key="site-page-header"
                title="SmartEV 智慧电池云平台"
                subTitle=''
                avatar={{ src: 'images/logodark_3durbanmob.png', shape: 'square' }}
                {...props}
                extra={[
                    <div key = 'setting'>
                        <Dropdown key='settings' overlay={menu} trigger={['click']}>
                            <Button key='Settingbuttom' type="text" >
                                <SettingOutlined />
                            </Button>
                        </Dropdown>
                        <Button key='navicollapsed' type="text" onClick={toggleCollapsed}>
                            {React.createElement(collapsed ? UpOutlined : DownOutlined)}
                        </Button>
                    </div>
                ]}
            >
            </PageHeader> : <Button key='navicollapsed' type="text" onClick={toggleCollapsed}>
                {React.createElement(collapsed ? UpOutlined : DownOutlined)}
            </Button>}
        </>
    )
}

