import React from 'react';

interface globPageModel { 
  name:string;
  path:string;
  component:React.FC;
}

// Auto generates routes from files under ./pages
// https://vitejs.dev/guide/features.html#glob-import
export const pages = import.meta.globEager('./*.jsx')

//
export const routes:[globPageModel] = Object.keys(pages).map((path) => {
  const name = path.match(/\.\/(.*)\.jsx$/)[1]
  return {
    name,
    path: name === 'Home' ? '/' : `/${name.toLowerCase()}`,
    component: pages[path].default
  }
})