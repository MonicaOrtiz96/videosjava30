(function(){
    
        //vertex shader calcular posiciones y vertices de los primitivos
        //y el frament shader calcula el color y la posicion de los primitivos
    
        let scene = new THREE.Scene();
        const aspectRatio = window.innerWidth / window.innerHeight;
        let camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 100);
        let renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
    
        camera.position.z = 50;
        camera.position.y = 10;
        camera.position.x = 60;
       
        //las dimencsiones y forma de figura
        let geometry = new THREE.BoxGeometry(10,10,10,10);
        let geometryCone = new THREE.ConeBufferGeometry( 5, 20, 32 ); // la geometria del coneBuffer
        let geometryRing = new THREE.RingBufferGeometry( 1, 5, 32 );
        let geometryCircle = new THREE.CircleBufferGeometry( 5, 32 );
        let geometryCylinder = new THREE.CylinderGeometry( 5, 5, 20, 32 );
        
        // se crea el material de las figuras
        let groundMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff
        });
        let materialCone = new THREE.MeshBasicMaterial( { /// declara el material del coneBuffet
            color: 0x9811C1
        });
        let materialRing = new THREE.MeshBasicMaterial( {
             color: 0x77DBF9,
             side: THREE.DoubleSide
        });
        let materialCircle = new THREE.MeshBasicMaterial( { 
                 color: 0xFA1F2D
        });
         let materialCylinder = new THREE.MeshBasicMaterial( {
             color: 0xE41FFA
        });
        
        //posicion y que se muestren las figuras
        let mesh = new THREE.Mesh(geometry, groundMaterial);
        mesh.position.x=9;
        let cone = new THREE.Mesh( geometryCone, materialCone );
        cone.position.x=30;
        let  ring = new THREE.Mesh( geometryRing, materialRing );
        ring.position.x=50;
        let circle = new THREE.Mesh( geometryCircle, materialCircle );
        circle.position.x=60;
         let cylinder = new THREE.Mesh( geometryCylinder, materialCylinder);
        cylinder.position.x=80;
        
        let pointLight = new THREE.PointLight(0x404040);
    
        pointLight.position.y = 80;
        pointLight.position.z = 20;

        scene.add(mesh); // agrega el mesh a la scena
        scene.add( cone ); // agtrega el cono a la scena 
        scene.add( ring ); // agrega el ring a la scena
        scene.add( circle ); // agrega el circulo a la scena
        scene.add( cylinder ); // agrega el cilindro a la scena
        
        scene.background = new THREE.Color(0xB128FF);
        scene.add(new THREE.AmbientLight(0x404040));
        scene.add(pointLight);
        scene.add(mesh);
    
    
        function loop(){
            requestAnimationFrame(loop);
            mesh.rotation.y += 0.01;
            mesh.rotation.z += 0.01;
            mesh.rotation.x += 0.01;
            cone.rotation.y += 0.01;
            cone.rotation.z += 0.01;
            cone.rotation.x += 0.01;
            ring.rotation.y += 0.01;
            ring.rotation.z += 0.01;
            ring.rotation.x += 0.01;
            circle.rotation.y += 0.01;
            circle.rotation.z += 0.01;
            circle.rotation.x += 0.01;
            cylinder.rotation.y += 0.01;
            cylinder.rotation.z += 0.01;
            cylinder.rotation.x += 0.01;
            renderer.render(scene, camera);
        }
    
        loop();
    
    })();