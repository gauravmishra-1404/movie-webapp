import React from 'react'
import { useSelector } from 'react-redux'
import { Spin } from 'antd';


function Loader() {
    const { loading } = useSelector((state) => state.loaders);

    return loading ? (<div style={{ position: 'absolute', top: 100, right: 30, zIndex: 100 }}>
        <Spin />
    </div>) : null
}

export default Loader