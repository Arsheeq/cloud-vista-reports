
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import Stepper from "@/components/Stepper";
import { useReport } from "@/context/ReportContext";
import { CloudProvider } from "@/types";

const fadeInVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const cardVariants = {
  hover: { 
    scale: 1.03,
    boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.98 }
};

const steps = ["Cloud Provider", "Report Type", "Credentials", "Details", "Generate"];

const SelectProvider = () => {
  const navigate = useNavigate();
  const { provider, setProvider, resetReport } = useReport();

  const handleSelectProvider = (value: CloudProvider) => {
    setProvider(value);
  };

  const handleNext = () => {
    if (provider) {
      navigate("/report-type");
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <Stepper steps={steps} currentStep={0} />
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
        >
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-2xl">Select Cloud Provider</CardTitle>
              <CardDescription>
                Choose the cloud provider you want to generate insights for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div 
                    onClick={() => handleSelectProvider("aws")}
                    whileHover="hover"
                    whileTap="tap"
                    variants={cardVariants}
                    className={`p-6 border rounded-xl cursor-pointer transition-all ${
                      provider === "aws" 
                        ? "border-nubinix-blue bg-blue-50 shadow-md" 
                        : "border-gray-200 hover:border-nubinix-blue hover:bg-blue-50/30"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-[#FF9900] rounded-lg flex items-center justify-center text-white mb-3">
                        <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.36922 11.8181C7.36922 12.3636 7.43621 12.8053 7.55967 13.143C7.68314 13.4808 7.84258 13.8281 8.05302 14.1851C8.11052 14.2756 8.13399 14.366 8.13399 14.4472C8.13399 14.5472 8.08247 14.6472 7.97847 14.7472L7.21426 15.3209C7.13428 15.3834 7.04978 15.4146 6.96979 15.4146C6.87978 15.4146 6.78977 15.3739 6.70029 15.2926C6.52284 15.1249 6.35889 14.9447 6.20845 14.752C6.05801 14.5593 5.91707 14.3541 5.78411 14.1365C5.25516 14.8066 4.59773 15.1417 3.8118 15.1417C3.25588 15.1417 2.81048 14.9719 2.47662 14.6324C2.14276 14.2929 1.97631 13.8311 1.97631 13.2469C1.97631 12.6349 2.17725 12.1292 2.57966 11.7298C2.98206 11.3303 3.52848 11.1306 4.21891 11.1306C4.46282 11.1306 4.71623 11.1556 4.97914 11.2002C5.24205 11.2447 5.51896 11.308 5.80987 11.3803V10.9059C5.80987 10.3875 5.7061 10.0171 5.49908 9.79477C5.29206 9.57243 4.93571 9.46202 4.43003 9.46202C4.14861 9.46202 3.8602 9.49454 3.56929 9.56008C3.27839 9.62563 2.99097 9.71316 2.70807 9.82269C2.58461 9.87673 2.48861 9.90638 2.43107 9.91839C2.37353 9.93041 2.33151 9.93729 2.30051 9.93729C2.19651 9.93729 2.14398 9.86474 2.14398 9.71915V9.12292C2.14398 9.01452 2.16148 8.92961 2.19649 8.87557C2.23149 8.82153 2.29502 8.7675 2.38907 8.71346C2.67198 8.58229 3.00238 8.47188 3.38179 8.38147C3.76071 8.29106 4.16312 8.24635 4.58902 8.24635C5.39193 8.24635 5.9898 8.43066 6.38271 8.79878C6.77511 9.1674 6.97263 9.73551 6.97263 10.4978V11.8181H7.36922ZM4.14859 13.9798C4.42049 13.9798 4.6974 13.9057 4.9833 13.7568C5.26921 13.608 5.50363 13.3785 5.68058 13.0683C5.78458 12.8977 5.86008 12.7079 5.90207 12.499C5.94408 12.2905 5.96508 12.0432 5.96508 11.7568V11.5125C5.75755 11.4571 5.53213 11.4094 5.28872 11.3688C5.04531 11.3283 4.8024 11.3081 4.55999 11.3081C4.10509 11.3081 3.7577 11.4019 3.52027 11.5913C3.28284 11.7807 3.16388 12.0525 3.16388 12.4068C3.16388 12.7431 3.26138 13.0001 3.45641 13.1782C3.65143 13.3555 3.86795 13.4453 4.14859 13.4453V13.9798ZM11.6617 15.3625C11.5322 15.3625 11.4412 15.3414 11.3782 15.2981C11.3152 15.2549 11.2592 15.1683 11.2102 15.0486L9.02804 9.20504C8.97901 9.0733 8.9545 8.97976 8.9545 8.92515C8.9545 8.81575 9.01054 8.75933 9.1231 8.75933H9.90929C10.0453 8.75933 10.1398 8.78043 10.2028 8.82367C10.2658 8.86691 10.3118 8.95358 10.3608 9.07319L11.9553 14.0027L13.4624 9.07319C13.5059 8.95358 13.5509 8.86691 13.6139 8.82367C13.6769 8.78043 13.7714 8.75933 13.9073 8.75933H14.5903C14.7263 8.75933 14.8208 8.78043 14.8838 8.82367C14.9468 8.86691 14.9898 8.95358 15.0348 9.07319L16.5549 14.057L18.1943 9.07319C18.2433 8.95358 18.2893 8.86691 18.3523 8.82367C18.4153 8.78043 18.5098 8.75933 18.6443 8.75933H19.3865C19.4991 8.75933 19.5551 8.81575 19.5551 8.92515C19.5551 8.97464 19.5466 9.02719 19.5306 9.08362C19.5146 9.14005 19.4916 9.2046 19.4596 9.27792L17.2395 15.0486C17.1905 15.1683 17.1345 15.2549 17.0715 15.2981C17.0085 15.3414 16.9175 15.3625 16.788 15.3625H16.0658C15.9298 15.3625 15.8353 15.3414 15.7723 15.2981C15.7093 15.2549 15.6633 15.1683 15.6178 15.0557L14.1328 10.3142L12.6532 15.0486C12.6077 15.1683 12.5617 15.2549 12.4987 15.2981C12.4357 15.3414 12.3412 15.3625 12.2052 15.3625H11.6617ZM21.8256 15.4419C21.5342 15.4419 21.2447 15.4131 20.9573 15.3555C20.6713 15.2978 20.4479 15.2401 20.2934 15.1799C20.1839 15.1342 20.1059 15.0842 20.0709 15.0309C20.0359 14.9776 20.0179 14.9175 20.0179 14.8559V14.2591C20.0179 14.1174 20.0734 14.0466 20.1869 14.0466C20.2579 14.0466 20.3319 14.0599 20.4089 14.0857C20.4859 14.1124 20.5793 14.1433 20.6873 14.1749C20.8968 14.2324 21.1258 14.28 21.3748 14.31C21.6237 14.3392 21.8692 14.3542 22.1181 14.3542C22.5661 14.3542 22.9071 14.2825 23.1416 14.1391C23.3761 13.9958 23.4951 13.7825 23.4951 13.5075C23.4951 13.3291 23.4346 13.18 23.3146 13.0541C23.1931 12.9292 22.978 12.8149 22.6685 12.7116L21.6402 12.3691C21.1397 12.2058 20.7822 11.9741 20.5697 11.6758C20.3582 11.3775 20.2517 11.0483 20.2517 10.6908C20.2517 10.405 20.3187 10.1516 20.4527 9.93066C20.5867 9.71082 20.7677 9.52239 20.9967 9.3679C21.2242 9.21449 21.4882 9.09574 21.7882 9.01333C22.0882 8.93092 22.4107 8.88866 22.7532 8.88866C22.9047 8.88866 23.0608 8.89866 23.2153 8.91975C23.3713 8.94084 23.5158 8.96684 23.6568 8.99775C23.7898 9.02775 23.9128 9.05866 24.0268 9.09333C24.1408 9.12692 24.2298 9.16159 24.2933 9.19626C24.3903 9.24334 24.4614 9.29042 24.5064 9.34134C24.5514 9.39225 24.5724 9.45817 24.5724 9.54166V10.1025C24.5724 10.2442 24.5169 10.317 24.4034 10.317C24.3194 10.317 24.2072 10.2903 24.0662 10.2379C23.6638 10.1112 23.2038 10.0487 22.6878 10.0487C22.2933 10.0487 21.9922 10.1074 21.7872 10.226C21.5822 10.3447 21.4802 10.5346 21.4802 10.7988C21.4802 10.9771 21.5487 11.1321 21.6857 11.2596C21.8222 11.3871 22.0653 11.5071 22.4123 11.6187L23.4096 11.9612C23.9001 12.1245 24.2431 12.3454 24.4391 12.6236C24.6341 12.9015 24.7321 13.2207 24.7321 13.5783C24.7321 13.8741 24.6631 14.1376 24.5251 14.3684C24.3871 14.5992 24.1926 14.7952 23.9451 14.9564C23.6981 15.1176 23.4051 15.2405 23.0686 15.3271C22.7321 15.4036 22.2996 15.4419 21.8256 15.4419Z" fill="white"/>
                          <path d="M22.8136 18.343C19.2962 21.0051 14.1557 22.4022 9.70476 22.4022C3.54306 22.4022 -1.99036 19.788 -5.97974 15.5047C-6.35167 15.1047 -5.94925 14.5655 -5.49785 14.8668C-1.21244 17.3868 4.43854 18.908 10.3568 18.908C14.3882 18.908 18.8501 17.9942 22.9696 16.0996C23.5975 15.8073 24.1375 16.4875 22.8136 18.343Z" fill="white"/>
                          <path d="M24.1965 16.7393C23.8095 16.2489 21.9424 16.5024 20.9476 16.6303C20.5576 16.6703 20.5086 16.3292 20.8586 16.0771C22.614 14.7866 25.5223 15.1314 25.8553 15.5341C26.1882 15.9368 25.7768 19.0018 24.1484 20.4324C23.8199 20.7024 23.5089 20.557 23.6469 20.1931C24.0238 19.1977 24.5805 17.2296 24.1965 16.7393Z" fill="white"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium">Amazon Web Services</h3>
                      <p className="text-sm text-gray-500 mt-1 text-center">EC2, RDS, and other AWS services</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    onClick={() => handleSelectProvider("azure")}
                    whileHover="hover"
                    whileTap="tap"
                    variants={cardVariants}
                    className={`p-6 border rounded-xl cursor-pointer transition-all ${
                      provider === "azure" 
                        ? "border-nubinix-pink bg-pink-50 shadow-md" 
                        : "border-gray-200 hover:border-nubinix-pink hover:bg-pink-50/30"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-[#0078D4] rounded-lg flex items-center justify-center text-white mb-3">
                        <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.3335 2.00049L5.5918 6.66716L1.3335 11.5038H5.5918L11.3335 2.00049Z" fill="white"/>
                          <path d="M11.3328 2.00049L17.0745 6.66716L21.3328 11.5038H17.0745L11.3328 2.00049Z" fill="white"/>
                          <path d="M11.3328 21.9998L5.59115 17.3332L1.33282 12.4971H5.59115L11.3328 21.9998Z" fill="white"/>
                          <path d="M11.3328 21.9998L17.0745 17.3332L21.3328 12.4971H17.0745L11.3328 21.9998Z" fill="white"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium">Microsoft Azure</h3>
                      <p className="text-sm text-gray-500 mt-1 text-center">Virtual Machines, SQL Databases, and more</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleNext} 
                disabled={!provider}
                className="bg-gradient-to-r from-nubinix-blue to-nubinix-purple hover:from-nubinix-purple hover:to-nubinix-pink"
              >
                Next
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default SelectProvider;
