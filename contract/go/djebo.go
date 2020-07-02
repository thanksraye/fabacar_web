package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"bytes"

	"github.com/hyperledger/fabric/core/chaincode/shim"

	//shim library를 사용하겠다~~ >> DB(tx)에 access하고 체인코드를 호출하는 API를 제공
	sc "github.com/hyperledger/fabric/protos/peer" // 여기서 hyperledger에서 peer와 헷갈리기 때문에 이름을 바꿔주기 위해 sc 명령어를 사용한다
)

// Define the Smart Contract structure
type SmartContract struct {
}

// Define the car structure, with 4 properties.  Structure tags are used by encoding/json library
type USER struct {
	Name     string `json:"name"` //구조체에서 사용할 땐 Make, json으로 사용할 때는 make로 사용하겠다
	PhoneNum string `json:"phonenum"`
	Email    string `json:"email"`
}

var company_name string

type Report struct {
	Report_Type    string `json:"report_type"` // book, bike
	User           USER   `json:"user"`
	Barcode        string `json:"barcode"`
	Timestamp      string `json:"timestamp"`
	Context_Report string `json:"context_report"`
	Status         string `json:"status"` // 1:reported 2:validated 3:compansated 4:rejected
}

/*


 * The Init method is called when the Smart Contract "fabcar" is instantiated by the blockchain network
 * Best practice is to have any Ledger initialization in separate function -- see initLedger()
 */

//Init함수는 Chaincode 인스턴스화 중에 호출되는 함수
//SmartContract를 위한 함수이다~ 라고 이해하면됨
//포인터 리시버 >>구조체의 포인터만 전달, 메서드 내의 필드값 변경이 그대로 호출자에서 반영된다 (Golang과 체인코드, 블록체인 사례연구 책 p.33 참조)
// <---> 데이터 리시버
// APIstub >> shim 인터페이스를 호출해서 사용한다는걸 APIstub 라는 이름으로 줄여서 사용한다
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response { //sc >> Import 된 peer와 CLI peer를 구분하기 위해 사용
	//Init >> chaincode를 인스턴스화, 업그레이드 시킬때 자동으로 실행되는 함수 >> 생성자!!
	//인자로 shim라이브러리의 ChaincodeStubInterface를 매개변수를 사용한다
	/*stub >> 블록체인에 들어있는 Ledger에 접근할때 사용하는 매개체
		rpc개념과 비슷!! (내 시스템 안에 있는 func을 호출하는게 아니라 다른 시스템 안에 있는 fuc을 호출할때는 Remote Procedure Call이라는 형태로 call한다!!
		내가 call할 때 func을 호출하는 형태와 네트워크를 타고 목표하는 fuc을 호출하는 형태가 일관되게 유지해야한다!!
		but 네트워크를 타고갈때는 data형태로 이동을 한다!! 내 시스템안에서 func call을 하면 func 주소를 가지고 바로 호출하는데 네트워크를 타고 다른 시스템에 가게 되면
		그것을 Serialize를 통해 문자형태로 바꾸어서 네트워크 형태로 보내야 한다!!
	    Stub >> 내 시스템에 내에 있는, or 다른 시스템 내에 있는 특정한 형태의 func을 연결해주는 매개체

	*/

	//Shim에 있는 interface를 사용하는데 이름이 기니까 APIstub라는 이름으로 사용하겠다
	// shim.ChaincodeStubInterface >> 원장에 대한 접근 수정을 위한 interface >> get, put과 같은 method가 내장.
	return shim.Success(nil)
}

/*
 * The Invoke method is called as a result of an application request to run the Smart Contract "fabcar"
 * The calling application program has also specified the particular smart contract function to be called, with arguments
 */

/*Invode함수는 트랜잭션당 한번씩 호출되는 Chaincode API의 함수. Chaincode API인 shim에서 제공하는

 */
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	/*stub.getFunc~ 메소드 >>peer가 chaincode를 인스턴스화 시키면서 Init을 수행시키면

	>> web브라우저에서 user가 인자값을 넣고 function을 호출시켜 tx를 발생시켰을때 HyperLedger 블록체인에서 어떤게 호출되는 함수이고 어떤게 인자인지 구별하기 위해 사용!!*/
	// Route to the appropriate handler function to interact with the ledger appropriately

	if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "queryReport" {
		return s.queryReport(APIstub, args)
	} else if function == "registerReport" {
		return s.registerReport(APIstub, args)
	} else if function == "validateReport" {
		return s.validateReport(APIstub, args)
	} else if function == "queryAllReports" {
		return s.queryAllReports(APIstub)
		// else if function == "queryCompany" { // function이 querycar이냐?
		// 	return s.queryCompany(APIstub, args) //querycar 함수에 인자를 넣으면서 호출한다
		// } else if function == "registerUser" {
		// 	return s.registerUser(APIstub, args)
		// } else if function == "registerCompany" {
		// 	return s.registerCompany(APIstub, args)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {

	book_reports := []Report{
		Report{
			Report_Type: "book",
			User: USER{
				Name:     "gildong",
				PhoneNum: "0102302",
				Email:    "sdf@naver.com",
			},
			Barcode:        "00012565",
			Timestamp:      "2020.06.16 14:30",
			Context_Report: "splited",
			Status:         "0",
		},
	}

	bike_reports := []Report{
		Report{
			Report_Type: "bike",
			User: USER{
				Name:     "gildong",
				PhoneNum: "0102302",
				Email:    "sdf@naver.com",
			},
			Barcode:        "00012565",
			Timestamp:      "2020.06.16 14:30",
			Context_Report: "splited",
			Status:         "0",
		},
	}

	i := 0
	for i < len(book_reports) {
		fmt.Println("i is ", i)
		bookAsBytes, _ := json.Marshal(book_reports[i]) //network 형태로 전송시키려면 car의 구조체를 bytecode(JSON)로 변환시켜줘야 한다!!
		// '_'를 써서 에러는 처리하지 않음
		APIstub.PutState("REPORT"+strconv.Itoa(i), bookAsBytes)
		fmt.Println("Added", book_reports[i])
		i = i + 1
	}

	j := 0
	for j < len(bike_reports) {
		fmt.Println("j is ", i)
		bikeAsBytes, _ := json.Marshal(bike_reports[j]) //network 형태로 전송시키려면 car의 구조체를 bytecode(JSON)로 변환시켜줘야 한다!!
		// '_'를 써서 에러는 처리하지 않음
		APIstub.PutState("REPORT"+strconv.Itoa(j), bikeAsBytes)
		fmt.Println("Added", bike_reports[j])
		j = j + 1
	}

	return shim.Success(nil)
}

func (s *SmartContract) queryAllReports(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := "REPORT0"
	endKey := "REPORT999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllCars:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) queryReport(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	// queryCar가 interface를 사용하게따
	// queryCar을 하려면 어떤 car인지 인자가 필요하다!!
	// sc.Response >> sc : peer 라이브러리 내에서 Response를 쓰는데 Response 내에서는 반환하는 값들이 저장되어있다

	if len(args) != 1 { //인자의 길이가 0이면 에러를 발생시킨다
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	reportAsBytes, _ := APIstub.GetState(args[0]) //GetState >> stateDB에서 인자값에 해당하는 내용을 가져온다 >> 만약 원장에 commit 되지 않은 writeset 데이터는 읽지 않는다
	// _ >> carAsBytes를 반환할수 없으면 에러를 반환한다
	return shim.Success(reportAsBytes)
	//shim 라이브러리 내 Success 함수 >> stateDB에 잘 update가 되었다~ >> 성공상태 정보, 바이트 형태의 페이로드 데이터(user가 누군지, car는 어떤 차인지)를 반환 >> 여기서는 carAsBytes를 반환
}

func (s *SmartContract) registerReport(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 8 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	var registerReport = Report{Report_Type: args[7], User: USER{Name: args[1], PhoneNum: args[2], Email: args[3]}, Barcode: args[4], Timestamp: args[5], Context_Report: args[6], Status: "1"}

	registerReportAsBytes, _ := json.Marshal(registerReport)
	APIstub.PutState(args[0], registerReportAsBytes)

	return shim.Success(registerReportAsBytes)
}

func (s *SmartContract) validateReport(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}
	reportAsBytes, _ := APIstub.GetState(args[0])
	if reportAsBytes == nil {
		return shim.Error("The report is missing")
	}

	var registerReport = Report{}
	_ = json.Unmarshal(reportAsBytes, &registerReport)

	registerReport.Status = "2"
	registerReportAsBytes, _ := json.Marshal(registerReport)
	APIstub.PutState(args[0], registerReportAsBytes)

	return shim.Success(registerReportAsBytes)
}

// func (s *SmartContract) registerCompany(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

// 	if len(args) != 2 {
// 		return shim.Error("Incorrect number of arguments. Expecting 2")
// 	}

// 	company_name = arg[1]

// 	company_name, _ := json.Marshal(user)
// 	APIstub.PutState(args[0], registerBookCompany)
// 	// PutState가 발생되면 transaction이 일어나게 된다 >> 지정된 key와 value를 트랜잭션의 writeset에 data-write proposal 수행(일단 tx를 endorsor peer한테까지만 전달된 초기상태인 상황이다!!) >> 데이터 추가에 대한 요청(proposal)들만 수행 >> proposal들이 모여서 일정시간 검증되면 새로운 block이 생성된다 >> 또 다른 과정!!

// 	return shim.Success(nil)
// }

// func (s *SmartContract) registerUser(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

// 	if len(args) != 4 {
// 		return shim.Error("Incorrect number of arguments. Expecting 4")
// 	}

// 	var user = USER{Name: args[1], PhoneNum: args[2], Email: args[3]}

// 	userAsBytes, _ := json.Marshal(user)
// 	APIstub.PutState(args[0], userAsBytes)

// 	return shim.Success(userAsBytes)
// }
// func (s *SmartContract) queryCompany(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
// 	// queryCar가 interface를 사용하게따
// 	// queryCar을 하려면 어떤 car인지 인자가 필요하다!!
// 	// sc.Response >> sc : peer 라이브러리 내에서 Response를 쓰는데 Response 내에서는 반환하는 값들이 저장되어있다

// 	if len(args) != 1 { //인자의 길이가 0이면 에러를 발생시킨다
// 		return shim.Error("Incorrect number of arguments. Expecting 1")
// 	}

// 	companyAsBytes, _ := APIstub.GetState(args[0]) //GetState >> stateDB에서 인자값에 해당하는 내용을 가져온다 >> 만약 원장에 commit 되지 않은 writeset 데이터는 읽지 않는다
// 	// _ >> carAsBytes를 반환할수 없으면 에러를 반환한다
// 	return shim.Success(companyAsBytes)
// 	//shim 라이브러리 내 Success 함수 >> stateDB에 잘 update가 되었다~ >> 성공상태 정보, 바이트 형태의 페이로드 데이터(user가 누군지, car는 어떤 차인지)를 반환 >> 여기서는 carAsBytes를 반환
// }
/*
func (s *SmartContract) queryAllCars(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := "CAR0"
	endKey := "CAR999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	//GetStateByRange >> 원장에서 data를 읽어올때 더미로 읽어들이고 싶을때
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close() //finally 블럭처럼 마지막에 Clean-up 작업을 하기 위해 사용

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllCars:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) changeCarOwner(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	carAsBytes, _ := APIstub.GetState(args[0]) // 인자인 key값(args[0])에 대한 stateDB 내의 date를 보여준다
	car := Car{}

	json.Unmarshal(carAsBytes, &car) // 전달받은 carAsBytes라는 JSON 형식의 데이터를 car 구조체 안의 값으로 집어넣음
	car.Owner = args[1]

	carAsBytes, _ = json.Marshal(car)
	APIstub.PutState(args[0], carAsBytes)

	return shim.Success(nil)
}
*/
// The main function is only relevant in unit test mode. Only included here for completeness.
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract)) //shim.start >> 스마트 컨트랙트 생성
	if err != nil {                       //스마트 컨트랙트를 발생시켰을때 에러가 발생되었으면 출력하겠다
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
