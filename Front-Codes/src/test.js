const data= prompt("لطفا تاریخ را وارد نمایید");

const paterdata=/\d{4}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[01])/;

const dataresult=paterdata.test(data);

if(dataresult){
    console.log("باموفقیت وارد شد")
}else{
    console.log("لطفا تاریخ درست را وراد نمایید")
}

