# Comment déployer un cluster K8s from scratch 

En supposant que le master et worker nodes sont déjà en place,
1. Permettre aux noeuds de voir le trafic Bridge en exécutant 
```
sudo modprobe br_netfilte
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
br_netfilter
EOF

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
sudo sysctl --system
```

1. créer CA_CERT, MASTER_CERT et MASTER_KEY et les mettre respectivement dans
   `/srv/kubernetes/ca.crt`,
   `/srv/kubernetes/server.crt`,
   `/srv/kubernetes/server.key`

[//]: # (CA_CERT)

[//]: # (put in on node where apiserver runs, in e.g. /srv/kubernetes/ca.crt.)

[//]: # (MASTER_CERT)

[//]: # (signed by CA_CERT)

[//]: # (put in on node where apiserver runs, in e.g. /srv/kubernetes/server.crt)

[//]: # (MASTER_KEY)

[//]: # (put in on node where apiserver runs, in e.g. /srv/kubernetes/server.key)

2. Créer le token d'authentification pour les workers nodes
`TOKEN=$(dd if=/dev/urandom bs=128 count=1 2>/dev/null | base64 | tr -d "=+/" | dd bs=32 count=1 2>/dev/null)`

3. Créer la configuration nécessaire
```
kubectl config set-cluster $CLUSTER_NAME --certificate-authority=$CA_CERT --embed-certs=true --server=https://$MASTER_IP
kubectl config set-credentials $USER --client-certificate=$MASTER_CERT --client-key=$MASTER_KEY --embed-certs=true --token=$TOKEN
```

4. Insaller les logiciels sur tous les noeuds
   1. Docker
   
   Préparer l'interface réseau pour Docker
   ```
    iptables -t nat -F
    ip link set docker0 down
    ip link delete docker0
    ```
   Installer Docker en suivant la [documentation officielle](https://docs.docker.com/engine/install/)
   2. kubelet
   
   Installer kubelet depuis [url](https://github.com/kubernetes/kubernetes/releases/tag/v1.23.4) et l'exécuter en ajoutant les options
   ```
   --api-servers=http://$MASTER_IP
   --config=/etc/kubernetes/manifests
   ```
   3. kube-proxy
    
    Installer kube-prox depuis [url](https://github.com/kubernetes/kubernetes/releases/tag/v1.23.4) et l'exécuter en ajoutant les options
    ```
    --master=http://$MASTER_IP
    ```

5. Installer
Apiserver, Scheduler, Controller Manager et  etcd et les exécuter
