// Rasterización ortográfica de compatibilidad. Utiliza las mismas mallas, cámara y puntero que WebGL.
window.createLegionSoftwareRenderer = function createSoftwareRenderer(canvas){
  const T=window.THREE,ctx=canvas.getContext('2d',{alpha:true});
  if(!ctx)throw Error('Canvas 2D no disponible');
  let width=1,height=1,ratio=1,cssWidth=1,cssHeight=1,img=null,depth=null;
  const temp=new T.Matrix4(),world=new T.Matrix4(),pv=new T.Matrix4(),mvp=new T.Matrix4(),normal=new T.Matrix3();
  const textures=new WeakMap(),palettes=new WeakMap(),buffers=new WeakMap();
  const bytes=(value)=>Math.max(0,Math.min(255,Math.round(value)));
  function size(w,h){
    cssWidth=w;cssHeight=h;
    const factor=Math.min(ratio,960/w,500/h);
    width=Math.max(1,Math.round(w*factor));height=Math.max(1,Math.round(h*factor));
    if(canvas.width===width&&canvas.height===height&&img)return;
    canvas.width=width;canvas.height=height;img=ctx.createImageData(width,height);depth=new Float32Array(width*height);
  }
  function texture(m){
    if(!m.map)return null;
    const image=m.map.image;if(!textures.has(image))textures.set(image,image.getContext('2d').getImageData(0,0,image.width,image.height));
    return textures.get(image);
  }
  function palette(m){
    if(!palettes.has(m)){
      const c=m.color.clone().convertLinearToSRGB(),table=[];
      for(let i=0;i<33;i++){const light=.49+i*.024;table.push([bytes(c.r*255*light),bytes(c.g*255*light),bytes(c.b*255*light)]);}
      palettes.set(m,table);
    }
    return palettes.get(m);
  }
  function drawMesh(geo,m,transform){
    const pos=geo.attributes.position;if(!pos)return;
    const xyz=pos.array,indices=geo.index?.array,normals=geo.attributes.normal?.array,uv=geo.attributes.uv?.array,map=texture(m),table=palette(m);
    const screen=buffers.get(geo)||new Float32Array(xyz.length);buffers.set(geo,screen);
    const e=mvp.multiplyMatrices(pv,transform).elements,n=normal.getNormalMatrix(transform).elements;
    for(let i=0;i<xyz.length;i+=3){
      const x=xyz[i],y=xyz[i+1],z=xyz[i+2];
      screen[i]=(e[0]*x+e[4]*y+e[8]*z+e[12]+1)*width*.5;
      screen[i+1]=(1-e[1]*x-e[5]*y-e[9]*z-e[13])*height*.5;
      screen[i+2]=e[2]*x+e[6]*y+e[10]*z+e[14];
    }
    const count=indices?indices.length:pos.count,pixels=img.data;
    for(let k=0;k<count;k+=3){
      const a=(indices?indices[k]:k)*3,b=(indices?indices[k+1]:k+1)*3,c=(indices?indices[k+2]:k+2)*3;
      const x=screen[a],y=screen[a+1],bx=screen[b],by=screen[b+1],cx=screen[c],cy=screen[c+1];
      const area=(bx-x)*(cy-y)-(by-y)*(cx-x);if(area>-.035)continue;
      const x0=Math.max(0,Math.ceil(Math.min(x,bx,cx)-.5)),x1=Math.min(width-1,Math.floor(Math.max(x,bx,cx)-.5));
      const y0=Math.max(0,Math.ceil(Math.min(y,by,cy)-.5)),y1=Math.min(height-1,Math.floor(Math.max(y,by,cy)-.5));
      if(x0>x1||y0>y1)continue;
      let shade=21;
      if(!m.isMeshBasicMaterial&&normals){
        const nx=normals[a],ny=normals[a+1],nz=normals[a+2];
        const i=n[0]*nx+n[3]*ny+n[6]*nz,j=n[1]*nx+n[4]*ny+n[7]*nz,l=n[2]*nx+n[5]*ny+n[8]*nz;
        const length=Math.sqrt(i*i+j*j+l*l)||1;
        shade=Math.min(32,Math.max(0,Math.round(8+6*j/length+13*Math.max(0,(-.48*i+.77*j+.43*l)/length)+4*Math.max(0,(.58*i+.43*j-.68*l)/length))));
      }
      const col=table[shade],da=-(cy-by)/area,db=-(y-cy)/area,za=screen[a+2]-screen[c+2],zb=screen[b+2]-screen[c+2],zc=screen[c+2]-(m.polygonOffset?1e-5:0);
      const ua=uv?a/3*2:0,ub=uv?b/3*2:0,uc=uv?c/3*2:0;
      for(let row=y0;row<=y1;row++){
        const px=x0+.5,py=row+.5;
        let wa=((cx-bx)*(py-by)-(cy-by)*(px-bx))/area,wb=((x-cx)*(py-cy)-(y-cy)*(px-cx))/area;
        for(let colX=x0,index=row*width+x0;colX<=x1;colX++,index++,wa+=da,wb+=db){
          if(wa<-.00001||wb<-.00001||wa+wb>1.00001)continue;
          const z=zc+wa*za+wb*zb;if(z>depth[index]+1e-7)continue;
          let red=col[0],green=col[1],blue=col[2],alpha=255*m.opacity;
          if(map&&uv){
            const wc=1-wa-wb;
            const tx=Math.max(0,Math.min(map.width-1,(map.width*(uv[ua]*wa+uv[ub]*wb+uv[uc]*wc))|0));
            const ty=Math.max(0,Math.min(map.height-1,(map.height*(1-uv[ua+1]*wa-uv[ub+1]*wb-uv[uc+1]*wc))|0));
            const o=4*(tx+ty*map.width);red=map.data[o];green=map.data[o+1];blue=map.data[o+2];alpha=map.data[o+3]*m.opacity;
          }
          if(alpha<2)continue;
          const dst=index*4;
          if(alpha>=254||!pixels[dst+3]){
            pixels[dst]=red;pixels[dst+1]=green;pixels[dst+2]=blue;pixels[dst+3]=alpha;
          }else{
            const a=alpha/255,b=pixels[dst+3]/255*(1-a),both=a+b;
            pixels[dst]=(red*a+pixels[dst]*b)/both;pixels[dst+1]=(green*a+pixels[dst+1]*b)/both;pixels[dst+2]=(blue*a+pixels[dst+2]*b)/both;pixels[dst+3]=both*255;
          }
          if(m.depthWrite)depth[index]=z;
        }
      }
    }
  }
  function paint(obj){
    if(obj.isInstancedMesh){
      for(let i=0;i<obj.count;i++){obj.getMatrixAt(i,temp);world.multiplyMatrices(obj.matrixWorld,temp);drawMesh(obj.geometry,obj.material,world);}
    }else drawMesh(obj.geometry,obj.material,obj.matrixWorld);
  }
  function render(scene,camera){
    if(!img)size(cssWidth,cssHeight);
    img.data.fill(0);depth.fill(Infinity);scene.updateMatrixWorld();camera.updateMatrixWorld();
    pv.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);const trans=[],lines=[];
    scene.traverseVisible(o=>{if(o.isMesh){if(o.material.transparent)trans.push(o);else paint(o);}else if(o.isLineLoop)lines.push(o);});
    for(const o of trans)paint(o);
    ctx.putImageData(img,0,0);
    for(const o of lines){
      const at=o.geometry.attributes.position;if(!at)continue;
      ctx.beginPath();const v=new T.Vector3();
      for(let i=0;i<at.count;i++){v.fromBufferAttribute(at,i).applyMatrix4(o.matrixWorld).project(camera);const x=(1+v.x)*width/2,y=(1-v.y)*height/2;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}
      ctx.closePath();ctx.strokeStyle='#bfef62';ctx.lineWidth=Math.max(1.3,width/cssWidth*1.7);ctx.stroke();
    }
  }
  return {software:true,capabilities:{getMaxAnisotropy:()=>1},setClearColor(){},setSize:size,getPixelRatio:()=>ratio,setPixelRatio(r){ratio=r;size(cssWidth,cssHeight);},render};
};
