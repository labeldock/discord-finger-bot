import { useContext, Children, cloneElement } from 'react'

export const exportContextProvider = ({ Context, Provider }) => ({
  Context,
  Provider,
  Consumer: Context.Consumer,
  inject: () => {
    return useContext(Context) // eslint-disable-line react-hooks/rules-of-hooks
  }
})

export const isVNode = (vnode) => {
  try {
    return Boolean(vnode.$$typeof)
  } catch {
    return false;
  }
}

/* 
export const assignVNodeProps = (reactElement, option = { key: undefined }, key?: string | number) => {
  const assignedVnode = cloneElement(reactElement, option)
  const renderKey = isText(option.key) ? option.key : key
  if (isText(renderKey)) {
    return <React.Fragment key={renderKey}>{assignedVnode}</React.Fragment>
  } else {
    return assignedVnode
  }
}
*/

export function assignChildrenProps (children, option){
  const vnodes = Children.map(children, (vnode, index)=>{
    if(typeof option === "object"){
      return cloneElement(vnode, { index, ...option })
    } else if(typeof option === "function"){
      let recive = option(vnode, index)

      if(isVNode(recive)){
        return recive
      }
  
      if(typeof recive === "function"){
        const render = recive
        recive = { render }
      }
  
      if(typeof recive === "object"){
        return cloneElement(vnode, { ...recive, index })
      }
  
      return vnode
    } else {
      return children
    }
  })
  return vnodes;
}