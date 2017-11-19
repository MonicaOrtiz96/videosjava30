(function(){
    
        //vertex shader calcular posiciones y vertices de los primitivos
        //y el frament shader calcula el color y la posicion de los primitivos
    
        let scene = new THREE.Scene();
        const aspectRatio = window.innerWidth / window.innerHeight;
        let camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 100);
        let renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        //renderer.shadowMap.enabled = true; // ampliar el serbicio de las sombras para poder hacerlas 
       // renderer.shadowMap.soft = true; // hacer la sombra  mas suabe con respecto a la luz que estoy proyectando
       // renderer.shadowMap.type = THREE.PCFShadowMap; // la tipo de sombra que usaremos

        camera.position.z = 110;
        camera.position.y = 10;
        camera.position.x = -10;
        //camera.position.z=60; // para la tierra con la sombra
        //camera.position.y=15;


        

        let mesh;
        let meshmarte;
        let meshvenus;
        let meshmercurio;
        let meshjupiter;
        let meshsol;
        //let meshsaturno;
        //let meshurano;
        //let meshneptuno;
        //let meshpluton;

        // lo de la sombra
        /*let planeGeometry= new THREE.PlaneGeometry(200,900); // creacion de cl plano
        planeGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));// matrix de 4 ejes
        //  se rota y se refresque constantemente 
        let groundMaterial = new THREE.MeshPhongMaterial({ // genera el material en el mesh
            color: 0xffffff
        });
        let plane=new THREE.Mesh(planeGeometry, groundMaterial); // crear la geometria
        plane.receiveShadow= true;*/
        let loader= new THREE.TextureLoader();

    
       loader.load('public/sol.jpg', function(texture){
            let geometrysol = new THREE.SphereGeometry(60,100,100)
            let materialsol = new THREE.MeshBasicMaterial({
                map: texture
            })
    
            meshsol = new THREE.Mesh(geometrysol, materialsol);
    
            meshsol.position.y = 0;
            meshsol.position.x = -160;
            scene.add(meshsol);
        })

        loader.load('public/tierra.jpg', function(texture){
            let geometry = new THREE.SphereGeometry(13,100,100)
            let material = new THREE.MeshBasicMaterial({
                map: texture
            })
    
            mesh = new THREE.Mesh(geometry, material);
            //mesh.castShadow = true; // esa primitiba que estoy generando es la que proyectara la sombra
            //mesh.position.y = 25; // para lo de la sombbra
            mesh.position.y = 0;// para lo del sistema solar
            scene.add(mesh);
        })
        loader.load('public/marte.jpg', function(texture){
            let geometrymarte= new THREE.SphereGeometry(14,100,100)
            let materialmarte= new THREE.MeshBasicMaterial({
                 map: texture
             })
             meshmarte= new THREE.Mesh(geometrymarte, materialmarte);
    
             meshmarte.position.y=0;
             meshmarte.position.x=40;
             scene.add(meshmarte);
        })
        loader.load('public/venus.jpg', function(texture){
            let geometryvenus= new THREE.SphereGeometry(20.5,100,100)
            let materialvenus= new THREE.MeshBasicMaterial({
                 map: texture
             })
             meshvenus= new THREE.Mesh(geometryvenus, materialvenus);
    
             meshvenus.position.y=0;
             meshvenus.position.x=-40;
             scene.add(meshvenus);
        })
        loader.load('public/mercurio.jpg', function(texture){
            let geometrymercurio= new THREE.SphereGeometry(15.5,100,100)
            let materialmercurio= new THREE.MeshBasicMaterial({
                 map: texture
             })
             meshmercurio= new THREE.Mesh(geometrymercurio, materialmercurio);
    
             meshmercurio.position.y=0;
             meshmercurio.position.x=-80;
             scene.add(meshmercurio);
        })
      
        loader.load('public/jupiter.jpg', function(texture){
            let geometryjupiter= new THREE.SphereGeometry(25.5,100,100)
            let materialjupiter= new THREE.MeshBasicMaterial({
                 map: texture
             })
             meshjupiter= new THREE.Mesh(geometryjupiter, materialjupiter);
    
             meshjupiter.position.y=0;
             meshjupiter.position.x= 90;
             scene.add(meshjupiter);
        })
        /*loader.load('public/saturno.jpg', function(texture){
            let geometrysaturno= new THREE.SphereGeometry(50.5,100,100)
            let materialsaturno= new THREE.MeshBasicMaterial({
                 map: texture
             })
             meshsaturno= new THREE.Mesh(geometrysaturno, materialsaturno);
    
             meshsaturno.position.y=0;
             meshsaturno.position.x=-180;
             scene.add(meshsaturno);
        })*/
        /*loader.load('public/urano.jpg', function(texture){
            let geometryurano= new THREE.SphereGeometry(50.5,100,100)
            let materialurano= new THREE.MeshBasicMaterial({
                 map: texture
             })
             meshurano= new THREE.Mesh(geometryurano, materialurano);
    
             meshurano.position.y=0;
             meshurano.position.x=-180;
             scene.add(meshurano);
        })*/
        /*loader.load('public/neptuno.jpg', function(texture){
            let geometryneptuno= new THREE.SphereGeometry(50.5,100,100)
            let materialneptuno= new THREE.MeshBasicMaterial({
                 map: texture
             })
             meshneptuno= new THREE.Mesh(geometryneptuno, materialneptuno);
    
             meshneptuno.position.y=0;
             meshneptuno.position.x=-180;
             scene.add(meshneptuno);
        })*/
        /*loader.load('public/pluton.jpg', function(texture){
            let geometrypluton= new THREE.SphereGeometry(50.5,100,100)
            let materialpluton= new THREE.MeshBasicMaterial({
                 map: texture
             })
             meshpluton= new THREE.Mesh(geometrypluton, materialpluton);
    
             meshpluton.position.y=0;
             meshpluton.position.x=-180;
             scene.add(meshpluton);
        })*/

        //let geometry = new THREE.BoxGeometry(10,10,10,10);
    
     
        //let mesh = new THREE.Mesh(geometry, groundMaterial);
    
        let groundMaterial = new THREE.MeshPhongMaterial({ // genera el material en el mesh
            color: 0xffffff
        });

        let pointLight = new THREE.PointLight(0x606060);
    
        pointLight.position.y = 60;
        pointLight.position.z = 20;

        //pointLight.castShadow= true; // luz para la tierra con la sombra 
        
        //scene.background = new THREE.Color(0xFFFFFF); // fondo blanco la tierra con la sombra
        scene.background = new THREE.Color(0x0A0A0A); // fondo negro sistema solar
        scene.add(new THREE.AmbientLight(0x404040));
        //scene.add(plane); // plano para la tierra con la sombra
        scene.add(pointLight);

        let controls= new THREE.OrbitControls(camera, renderer.domElement); // agregas los controles
    
    
        function loop(){
            requestAnimationFrame(loop);
            //mesh.rotation.x += 0.01; // la tierra con la sombra
            //quitar la rotacion cuando ya se copie el codigo
            mesh.rotation.y += 0.01;
            mesh.rotation.z += 0.01;
            mesh.rotation.x += 0.01;
            meshsol.rotation.y += 0.01;
            meshsol.rotation.z += 0.01;
            meshsol.rotation.x += 0.01;
            meshmarte.rotation.y += 0.01;
            meshmarte.rotation.z += 0.01;
            meshmarte.rotation.x += 0.01;
            meshvenus.rotation.y += 0.01;
            meshvenus.rotation.z += 0.01;
            meshvenus.rotation.x += 0.01;
            meshmercurio.rotation.y += 0.01;
            meshmercurio.rotation.z += 0.01;
            meshmercurio.rotation.x += 0.01;
            meshjupiter.rotation.y += 0.01;
            meshjupiter.rotation.z += 0.01;
            meshjupiter.rotation.x += 0.01;
            renderer.render(scene, camera);
        }
    
        loop();
    
    })();