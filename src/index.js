import * as NovoRender from "@novorender/webgl-api";
import * as DataApi from '@novorender/data-js-api'
import * as Measures from '@novorender/measure-api'
import * as THREE from 'three'
import * as vectors from 'vec3'
async function main(canvas) {
    // Create API
    const api = NovoRender.createAPI();
    const Measure = Measures.createMeasureAPI()
    // Create a view
    const view = await api.createView({ background: { color: [0, 0, 0, 0] } }, canvas);

    const dataApi = DataApi.createAPI({
        serviceUrl: "https://data.novorender.com/api",
      });
    // load a predefined scene into the view, available views are cube, oilrig, condos
    const sceneData = await dataApi
    // Condos scene ID, but can be changed to any public scene ID
    .loadScene("3b5e65560dc4422da5c7c3f827b6a77c")
    .then((res) => {
      if ("error" in res) {
        throw res;
      } else {
        return res;
      }
    });
    
    const { url, db, settings, camera } = sceneData;
    let scene = await await api.loadScene(url, db);
    view.scene = scene
    // console.log(settings)
   
    // provide a controller, available controller types are static, orbit, flight and turntable
    view.camera.controller = api.createCameraController({ kind: "flight" }, canvas);
    let rotations=[],positions=[]
    let shift = false
    function SavePosition(num,event){
       if(event.shiftKey){
        let rotation = []

        rotation[0] = view.camera.rotation[0]
        rotation[1] = view.camera.rotation[1]
        rotation[2] = view.camera.rotation[2]
        rotation[3] = view.camera.rotation[3]
        let position = []

        position[0] = view.camera.position[0]
        position[1] = view.camera.position[1]
        position[2] = view.camera.position[2]
        //set Rotation
        rotations[num] = rotation
        positions[num] = position
        console.log(positions,rotations)
       }
       else if(rotations[num] !== undefined && positions[num] !== undefined)
       view.camera.controller.moveTo(positions[num],rotations[num])
    }
        document.querySelector(`.reset1`).addEventListener('click',(e)=>SavePosition(0,e))
        document.querySelector(`.reset2`).addEventListener('click',(e)=>SavePosition(1,e))
        document.querySelector(`.reset3`).addEventListener('click',(e)=>SavePosition(2,e))

        function isolateObjects(scene, ids,num) {
            // Set highlight 255 on all objects
            // Highlight index 255 is reserved fully transparent
            scene.objectHighlighter.objectHighlightIndices.fill(255);
          
            // Set highlight back to 0 for objects to be isolated
            // Highlight 0 should be neutral as we haven't changed view.settings.objectHighlights
            ids.forEach((id) => (scene.objectHighlighter.objectHighlightIndices[id] = num));
          
            scene.objectHighlighter.commit();
          }
        document.querySelector('.sub').addEventListener('click',async()=>{
            let Value = document.querySelector('.form input').value
            const iterator = view.scene.search({ searchPattern: `${Value}` });
            console.log(iterator)
            const result = [];
            for await (const object of iterator) {
              result.push(object.id);
            }
            if (result.length >= 1){
                console.log(result)
                isolateObjects(scene,result,0)
            }else{
                scene.objectHighlighter.objectHighlightIndices.fill(0);
                scene.objectHighlighter.commit();
            }
            
        })


        // document.querySelector(`.reset1`).addEventListener('click',()=>{
        //     view.camera.controller.moveTo(positions[0],rotations[0])
        // })
        // document.querySelector(`.reset2`).addEventListener('click',()=>{
        //     view.camera.controller.moveTo(positions[1],rotations[1])
        // })
        // document.querySelector(`.reset3`).addEventListener('click',()=>{
        //     view.camera.controller.moveTo(positions[2],rotations[2])
        // })
    const ctx = canvas.getContext("bitmaprenderer");
    for (; ;) { 

        const { clientWidth: width, clientHeight: height } = canvas;


       


        // handle resizes
        view.applySettings({ display: { width, height } });
        const output = await view.render();

        {
            const image = await output.getImage();
            if (image) {
                // display in canvas
                ctx?.transferFromImageBitmap(image);
            }
        }
        output.dispose();
        
    }
}

main(document.getElementById("output"));
