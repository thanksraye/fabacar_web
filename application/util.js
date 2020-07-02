const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, X509WalletMixin, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs')
const ccpPath = path.resolve(__dirname, '..', 'network' ,'connection.json');
console.log(ccpPath)
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

const  enroll_admin = async ()=> {
    try {
        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities['ca.example.com'].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists('admin');
        if (adminExists) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const identity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
        wallet.import('admin', identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
        process.exit(1);
    }
}


const register_user =  async ()=> {
    try {
        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('user1');
        if (userExists) {
            console.log('An identity for the user "user1" already exists in the wallet');
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists('admin');
        if (!adminExists) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: false } });

        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: 'user1', role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: 'user1', enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
        wallet.import('user1', userIdentity);
        console.log('Successfully registered and enrolled admin user "user1" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to register user "appUser": ${error}`);
        process.exit(1);
    }
}

const query_all_data =  async ()=> {
    try {
        // 안증서
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // sdk+인증서+connection 연결부
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
        
        // 채널접속
        const network = await gateway.getNetwork('mychannel');
        
        // 체인코드접속
        const contract = network.getContract('djebo');

        const result1 = await contract.evaluateTransaction('queryAllReports');
        //const result = await contract.evaluateTransaction('queryAllUsers');
        //console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        console.log(`Transaction has been evaluated, result is: ${result1.toString()}`);
        const dataArrya = ["", result1.toString()]
        return result1.toString()
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

const query_report =  async (key)=> {
    try {
        // 안증서
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // sdk+인증서+connection 연결부
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
        
        // 채널접속
        const network = await gateway.getNetwork('mychannel');
        

        // 체인코드접속
        const contract = network.getContract('djebo');
        
        // 체인코드 호출
        const result = await contract.evaluateTransaction('queryReport',key);
        console.log("fwfwefwefwefwefewf")
        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        await gateway.disconnect();
        
        return result1.toString()
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        // process.exit(1);
        return "No Data"
    }
}


const create_reports =  async (reportid, username, phonenumber, email, barcode, timestamp, content, type)=> {
    try {
        
        // 안증서
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // sdk+인증서+connection 연결부
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
        
        
        // 채널접속
        const network = await gateway.getNetwork('mychannel');
    
        // 체인코드접속
        const contract = network.getContract('djebo');
        
        // 체인코드 호출
        const result = await contract.submitTransaction('registerReport', reportid, username, phonenumber, email, barcode, timestamp, content, type);

        console.log('Transaction has been submitted');
        console.log(result)
        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}
// async function change_reports(key, buyer) {
//     try {
//         // load the network configuration
//         const ccpPath = path.resolve(__dirname , 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
//         let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

//         // Create a new file system based wallet for managing identities.
//         const walletPath = path.join(process.cwd(), 'wallet');
//         const wallet = await Wallets.newFileSystemWallet(walletPath);
//         console.log(`Wallet path: ${walletPath}`);

//         // Check to see if we've already enrolled the user.
//         const identity = await wallet.get('appUser');
//         if (!identity) {
//             console.log('An identity for the user "appUser" does not exist in the wallet');
//             console.log('Run the registerUser.js application before retrying');
//             return;
//         }

//         // Create a new gateway for connecting to our peer node.
//         const gateway = new Gateway();
//         await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

//         // Get the network (channel) our contract is deployed to.
//         const network = await gateway.getNetwork('mychannel');

//         // Get the contract from the network.
//         const contract = network.getContract('fabcar');
//         console.log("fwfew")
//         // Submit the specified transaction.
//         // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
//         // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
//         await contract.submitTransaction('changeCarOwner', key, buyer);
//         console.log('Transaction has been submitted');

//         // Disconnect from the gateway.
//         await gateway.disconnect();

//     } catch (error) {
//         console.error(`Failed to submit transaction: ${error}`);
//         process.exit(1);
//     }
// }

async function validate_report(reportNum , status) {
    try {
        // 안증서
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);
        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // sdk+인증서+connection 연결부
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
        
        
        // 채널접속
        const network = await gateway.getNetwork('mychannel');

        // 체인코드접속
        const contract = network.getContract('djebo');
        
        // 체인코드 호출
        console.log(reportNum+"--")
        const result = await contract.submitTransaction('validateReport',  reportNum);

        console.log('Transaction has been submitted');
        console.log(result)

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }

   
}

const initialAll = async ()=>{
    try {
        await shell.exec('rm -rf wallet')
        await enroll_dmin()
        await register_user()
        console.log('Success')
    }
    catch(error){
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}
module.exports = {enrollAdmin:enroll_admin, 
                registerUser:register_user , 
                queryAllData:query_all_data,
                //queryUser : query_user,
                queryReport : query_report,
                validateReport :validate_report,
                //createUsers:create_users,
                createReports:create_reports,
                //changeReports:change_reports
                }


// initialAll()
// enroll_dmin()
// register_user()
// query_all_data()
// query_user()
// query_report()
// validate_reports("REPORT3","4")
// create_reports() 
// changeCars()