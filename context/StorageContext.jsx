'use client'

import {createContext, useContext, useState, useEffect} from 'react';
import {getCookie, setCookie} from "@/lib/cookies";

const StorageContext = createContext();

export const StorageProvider = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [retirementMultiplier, setRetirementMultiplier] = useState(0.02);
    const [serviceLocalization, setServiceLocalization] = useState("USAF");
    const [promotions, setPromotions] = useState([]);

    const [firstLoad, setFirstLoad] = useState(true);

    useEffect(() => {
        if (firstLoad) {
            const sidebarOpenCookie = getCookie('sidebarOpen')
            const retirementMultiplierCookie = getCookie('retirementMultiplier')
            const serviceLocalizationCookie = getCookie('serviceLocalization')
            const promotionsCookie = getCookie('promotions')

            if (sidebarOpenCookie)
                setSidebarOpen(JSON.parse(sidebarOpenCookie))
            if (retirementMultiplierCookie)
                setRetirementMultiplier(parseFloat(retirementMultiplierCookie))
            if (serviceLocalizationCookie)
                setServiceLocalization(JSON.parse(serviceLocalizationCookie))
            if (promotionsCookie)
                setPromotions(JSON.parse(promotionsCookie))

            setFirstLoad(false)
        }
    })

    useEffect(() => {
        if (!firstLoad)
            setCookie('sidebarOpen', JSON.stringify(sidebarOpen))
    }, [sidebarOpen])

    useEffect(() => {
        if (!firstLoad)
            setCookie('retirementMultiplier', JSON.stringify(retirementMultiplier))
    }, [retirementMultiplier])

    useEffect(() => {
        if (!firstLoad)
            setCookie('serviceLocalization', JSON.stringify(serviceLocalization))
    }, [serviceLocalization])

    useEffect(() => {
        if (!firstLoad)
            setCookie('promotions', JSON.stringify(promotions))
    }, [promotions])

    const getRankInsigniaUrl = (grade) => {

        const formattedGrade = grade.replace("-", "").toLowerCase()

        switch (grade) {
            case "O-1E":
                return "/ranks/common/o1.png"
            case "O-2E":
                return "/ranks/common/o2.png"
            case "O-3E":
                return "/ranks/common/o3.png"
            case "O-1":
            case "O-2":
            case "O-3":
            case "O-4":
            case "O-5":
            case "O-6":
            case "O-7":
            case "O-8":
            case "O-9":
            case "O-10":
                return "/ranks/common/" + formattedGrade + ".png"
            case "W-1":
            case "W-5":
                if (
                    serviceLocalization === "USAF" ||
                    serviceLocalization === "USAR" ||
                    serviceLocalization === "USMC" ||
                    serviceLocalization === "USN"
                ) return "/ranks/" + serviceLocalization.toLowerCase() + "/" + formattedGrade + ".png"
                return null
            case "W-2":
            case "W-3":
            case "W-4":
                if (
                    serviceLocalization === "USAF" ||
                    serviceLocalization === "USAR" ||
                    serviceLocalization === "USCG" ||
                    serviceLocalization === "USMC" ||
                    serviceLocalization === "USN"
                ) return "/ranks/" + serviceLocalization.toLowerCase() + "/" + formattedGrade + ".png"
                return null
            case "E-1":
                if (serviceLocalization === "USSF") return "/ranks/ussf/e1.png"
                return null
            case "E-2":
            case "E-3":
            case "E-4":
            case "E-5":
            case "E-6":
            case "E-7":
            case "E-8":
            case "E-9":
                return "/ranks/" + serviceLocalization.toLowerCase() + "/" + formattedGrade + ".png"
            default:
                return null
        }
    }

    const getRankFromGrade = (grade, isShortName = false) => {

        const type = isShortName ? "ABBR" : "FULL"

        grade = grade.replace("-", "")

        const dictionary = {
            E1: {
                USAF: {
                    FULL: "Airman Basic",
                    ABBR: "AB"
                    },
                USAR: {
                    FULL: "Private",
                    ABBR: "PV1"
                    },
                USCG: {
                    FULL: "Seaman Recruit",
                    ABBR: "SR"
                },
                USMC: {
                    FULL: "Private",
                    ABBR: "Pvt"
                },
                USN: {
                    FULL: "Seaman Recruit",
                    ABBR: "SR"
                },
                USSF: {
                    FULL: "Specialist 1",
                    ABBR: "Spc1"
                }
            },
            E2: {
                USAF: {
                    FULL: "Airman",
                    ABBR: "Amn"
                },
                USAR: {
                    FULL: "Private",
                    ABBR: "PV2"
                },
                USCG: {
                    FULL: "Seaman Apprentice",
                    ABBR: "SA"
                },
                USMC: {
                    FULL: "Private First Class",
                    ABBR: "PFC"
                },
                USN: {
                    FULL: "Seaman Apprentice",
                    ABBR: "SA"
                },
                USSF: {
                    FULL: "Specialist 2",
                    ABBR: "Spc2"
                }
            },
            E3: {
                USAF: {
                    FULL: "Airman First Class",
                    ABBR: "A1C"
                },
                USAR: {
                    FULL: "Private First Class",
                    ABBR: "PFC"
                },
                USCG: {
                    FULL: "Seaman",
                    ABBR: "SN"
                },
                USMC: {
                    FULL: "Lance Corporal",
                    ABBR: "LCpl"
                },
                USN: {
                    FULL: "Seaman",
                    ABBR: "SN"
                },
                USSF: {
                    FULL: "Specialist 3",
                    ABBR: "Spc3"
                }
            },
            E4: {
                USAF: {
                    FULL: "Senior Airman",
                    ABBR: "SrA"
                },
                USAR: {
                    FULL: "Corporal",
                    ABBR: "CPL"
                },
                USCG: {
                    FULL: "Petty Officer Third Class",
                    ABBR: "PO3"
                },
                USMC: {
                    FULL: "Corporal",
                    ABBR: "Cpl"
                },
                USN: {
                    FULL: "Petty Officer Third Class",
                    ABBR: "PO3"
                },
                USSF: {
                    FULL: "Specialist 4",
                    ABBR: "Spc4"
                }
            },
            E5: {
                USAF: {
                    FULL: "Staff Sergeant",
                    ABBR: "SSgt"
                },
                USAR: {
                    FULL: "Sergeant",
                    ABBR: "SGT"
                },
                USCG: {
                    FULL: "Petty Officer Second Class",
                    ABBR: "PO2"
                },
                USMC: {
                    FULL: "Sergeant",
                    ABBR: "Sgt"
                },
                USN: {
                    FULL: "Petty Officer Second Class",
                    ABBR: "PO2"
                },
                USSF: {
                    FULL: "Sergeant",
                    ABBR: "Sgt"
                }
            },
            E6: {
                USAF: {
                    FULL: "Technical Sergeant",
                    ABBR: "TSgt"
                },
                USAR: {
                    FULL: "Staff Sergeant",
                    ABBR: "SSG"
                },
                USCG: {
                    FULL: "Petty Officer First Class",
                    ABBR: "PO1"
                },
                USMC: {
                    FULL: "Staff Sergeant",
                    ABBR: "SSgt"
                },
                USN: {
                    FULL: "Petty Officer First Class",
                    ABBR: "PO1"
                },
                USSF: {
                    FULL: "Technical Sergeant",
                    ABBR: "TSgt"
                }
            },
            E7: {
                USAF: {
                    FULL: "Master Sergeant",
                    ABBR: "MSgt"
                },
                USAR: {
                    FULL: "Sergeant First Class",
                    ABBR: "SFC"
                },
                USCG: {
                    FULL: "Chief Petty Officer",
                    ABBR: "CPO"
                },
                USMC: {
                    FULL: "Gunnery Sergeant",
                    ABBR: "GySgt"
                },
                USN: {
                    FULL: "Chief Petty Officer",
                    ABBR: "CPO"
                },
                USSF: {
                    FULL: "Master Sergeant",
                    ABBR: "MSgt"
                }
            },
            E8: {
                USAF: {
                    FULL: "Senior Master Sergeant",
                    ABBR: "SMSgt"
                },
                USAR: {
                    FULL: "Master Sergeant",
                    ABBR: "MSG"
                },
                USCG: {
                    FULL: "Senior Chief Petty Officer",
                    ABBR: "SCPO"
                },
                USMC: {
                    FULL: "Master Sergeant",
                    ABBR: "MSgt"
                },
                USN: {
                    FULL: "Senior Chief Petty Officer",
                    ABBR: "SCPO"
                },
                USSF: {
                    FULL: "Senior Master Sergeant",
                    ABBR: "SMSgt"
                }
            },
            E9: {
                USAF: {
                    FULL: "Chief Master Sergeant",
                    ABBR: "CMSgt"
                },
                USAR: {
                    FULL: "Sergeant Major",
                    ABBR: "SGM"
                },
                USCG: {
                    FULL: "Master Chief Petty Officer",
                    ABBR: "MCPO"
                },
                USMC: {
                    FULL: "Sergeant Major",
                    ABBR: "SgtMaj"
                },
                USN: {
                    FULL: "Master Chief Petty Officer",
                    ABBR: "MCPO"
                },
                USSF: {
                    FULL: "Chief Master Sergeant",
                    ABBR: "CMSgt"
                }
            },
            W1: {
                USAF: {
                    FULL: "Warrant Officer 1",
                    ABBR: "WO1"
                },
                USAR: {
                    FULL: "Warrant Officer 1",
                    ABBR: "WO1"
                },
                USCG: {
                    FULL: "Discontinued",
                    ABBR: "Discontinued"
                },
                USMC: {
                    FULL: "Warrant Officer 1",
                    ABBR: "WO"
                },
                USN: {
                    FULL: "Warrant Officer 1",
                    ABBR: "WO-1"
                },
                USSF: {
                    FULL: "Not Implemented",
                    ABBR: "Not Implemented"
                }
            },
            W2: {
                USAF: {
                    FULL: "Chief Warrant Officer 2",
                    ABBR: "CWO2"
                },
                USAR: {
                    FULL: "Chief Warrant Officer 2",
                    ABBR: "CWO2"
                },
                USCG: {
                    FULL: "Chief Warrant Officer 2",
                    ABBR: "CWO-2"
                },
                USMC: {
                    FULL: "Chief Warrant Officer 2",
                    ABBR: "CWO2"
                },
                USN: {
                    FULL: "Chief Warrant Officer 2",
                    ABBR: "CWO-2"
                },
                USSF: {
                    FULL: "Not Implemented",
                    ABBR: "Not Implemented"
                }
            },
            W3: {
                USAF: {
                    FULL: "Chief Warrant Officer 3",
                    ABBR: "CWO3"
                },
                USAR: {
                    FULL: "Chief Warrant Officer 3",
                    ABBR: "CWO3"
                },
                USCG: {
                    FULL: "Chief Warrant Officer 3",
                    ABBR: "CWO-3"
                },
                USMC: {
                    FULL: "Chief Warrant Officer 3",
                    ABBR: "CWO3"
                },
                USN: {
                    FULL: "Chief Warrant Officer 3",
                    ABBR: "CWO-3"
                },
                USSF: {
                    FULL: "Not Implemented",
                    ABBR: "Not Implemented"
                }
            },
            W4: {
                USAF: {
                    FULL: "Chief Warrant Officer 4",
                    ABBR: "CWO4"
                },
                USAR: {
                    FULL: "Chief Warrant Officer 4",
                    ABBR: "CWO4"
                },
                USCG: {
                    FULL: "Chief Warrant Officer 4",
                    ABBR: "CWO-4"
                },
                USMC: {
                    FULL: "Chief Warrant Officer 4",
                    ABBR: "CWO4"
                },
                USN: {
                    FULL: "Chief Warrant Officer 4",
                    ABBR: "CWO-4"
                },
                USSF: {
                    FULL: "Not Implemented",
                    ABBR: "Not Implemented"
                }
            },
            W5: {
                USAF: {
                    FULL: "Chief Warrant Officer 5",
                    ABBR: "CWO5"
                },
                USAR: {
                    FULL: "Chief Warrant Officer 5",
                    ABBR: "CWO5"
                },
                USCG: {
                    FULL: "Not Implemented",
                    ABBR: "Not Implemented"
                },
                USMC: {
                    FULL: "Chief Warrant Officer 5",
                    ABBR: "CWO5"
                },
                USN: {
                    FULL: "Chief Warrant Officer 5",
                    ABBR: "CWO-5"
                },
                USSF: {
                    FULL: "Not Implemented",
                    ABBR: "Not Implemented"
                }
            },
            O1: {
                USAF: {
                    FULL: "Second Lieutenant",
                    ABBR: "2d Lt"
                },
                USAR: {
                    FULL: "Second Lieutenant",
                    ABBR: "2LT"
                },
                USCG: {
                    FULL: "Ensign",
                    ABBR: "ENS"
                },
                USMC: {
                    FULL: "Second Lieutenant",
                    ABBR: "2ndLt"
                },
                USN: {
                    FULL: "Ensign",
                    ABBR: "ENS"
                },
                USSF: {
                    FULL: "Second Lieutenant",
                    ABBR: "2d Lt"
                }
            },
            O2: {
                USAF: {
                    FULL: "First Lieutenant",
                    ABBR: "1st Lt"
                },
                USAR: {
                    FULL: "First Lieutenant",
                    ABBR: "1LT"
                },
                USCG: {
                    FULL: "Lieutenant (Junior Grade)",
                    ABBR: "LTJG"
                },
                USMC: {
                    FULL: "First Lieutenant",
                    ABBR: "1stLt"
                },
                USN: {
                    FULL: "Lieutenant (Junior Grade)",
                    ABBR: "LTJG"
                },
                USSF: {
                    FULL: "First Lieutenant",
                    ABBR: "1st Lt"
                }
            },
            O3: {
                USAF: {
                    FULL: "Captain",
                    ABBR: "Capt"
                },
                USAR: {
                    FULL: "Captain",
                    ABBR: "CPT"
                },
                USCG: {
                    FULL: "Lieutenant",
                    ABBR: "LT"
                },
                USMC: {
                    FULL: "Captain",
                    ABBR: "Capt"
                },
                USN: {
                    FULL: "Lieutenant",
                    ABBR: "LT"
                },
                USSF: {
                    FULL: "Captain",
                    ABBR: "Capt"
                }
            },
            O4: {
                USAF: {
                    FULL: "Major",
                    ABBR: "Maj"
                },
                USAR: {
                    FULL: "Major",
                    ABBR: "MAJ"
                },
                USCG: {
                    FULL: "Lieutenant Commander",
                    ABBR: "LCDR"
                },
                USMC: {
                    FULL: "Major",
                    ABBR: "Maj"
                },
                USN: {
                    FULL: "Lieutenant Commander",
                    ABBR: "LCDR"
                },
                USSF: {
                    FULL: "Major",
                    ABBR: "Maj"
                }
            },
            O5: {
                USAF: {
                    FULL: "Lieutenant Colonel",
                    ABBR: "Lt Col"
                },
                USAR: {
                    FULL: "Lieutenant Colonel",
                    ABBR: "LTC"
                },
                USCG: {
                    FULL: "Commander",
                    ABBR: "CDR"
                },
                USMC: {
                    FULL: "Lieutenant Colonel",
                    ABBR: "LtCol"
                },
                USN: {
                    FULL: "Commander",
                    ABBR: "CDR"
                },
                USSF: {
                    FULL: "Lieutenant Colonel",
                    ABBR: "Lt Col"
                }
            },
            O6: {
                USAF: {
                    FULL: "Colonel",
                    ABBR: "Col"
                },
                USAR: {
                    FULL: "Colonel",
                    ABBR: "COL"
                },
                USCG: {
                    FULL: "Captain",
                    ABBR: "CAPT"
                },
                USMC: {
                    FULL: "Colonel",
                    ABBR: "Col"
                },
                USN: {
                    FULL: "Captain",
                    ABBR: "CAPT"
                },
                USSF: {
                    FULL: "Colonel",
                    ABBR: "Col"
                }
            },
            O7: {
                USAF: {
                    FULL: "Brigadier General",
                    ABBR: "Brig Gen"
                },
                USAR: {
                    FULL: "Brigadier General",
                    ABBR: "BG"
                },
                USCG: {
                    FULL: "Rear Admiral (Lower Half)",
                    ABBR: "RDML"
                },
                USMC: {
                    FULL: "Brigadier General",
                    ABBR: "BGen"
                },
                USN: {
                    FULL: "Rear Admiral (Lower Half)",
                    ABBR: "RDML"
                },
                USSF: {
                    FULL: "Brigadier General",
                    ABBR: "Brig Gen"
                }
            },
            O8: {
                USAF: {
                    FULL: "Major General",
                    ABBR: "Maj Gen"
                },
                USAR: {
                    FULL: "Major General",
                    ABBR: "MG"
                },
                USCG: {
                    FULL: "Rear Admiral (Upper Half)",
                    ABBR: "RADM"
                },
                USMC: {
                    FULL: "Major General",
                    ABBR: "MajGen"
                },
                USN: {
                    FULL: "Rear Admiral",
                    ABBR: "RADM"
                },
                USSF: {
                    FULL: "Major General",
                    ABBR: "Maj Gen"
                }
            },
            O9: {
                USAF: {
                    FULL: "Lieutenant General",
                    ABBR: "Lt Gen"
                },
                USAR: {
                    FULL: "Lieutenant General",
                    ABBR: "LTG"
                },
                USCG: {
                    FULL: "Vice Admiral",
                    ABBR: "VADM"
                },
                USMC: {
                    FULL: "Lieutenant General",
                    ABBR: "LtGen"
                },
                USN: {
                    FULL: "Vice Admiral",
                    ABBR: "VADM"
                },
                USSF: {
                    FULL: "Lieutenant General",
                    ABBR: "Lt Gen"
                }
            },
            O10: {
                USAF: {
                    FULL: "General",
                    ABBR: "Gen"
                },
                USAR: {
                    FULL: "General",
                    ABBR: "GEN"
                },
                USCG: {
                    FULL: "Admiral",
                    ABBR: "ADM"
                },
                USMC: {
                    FULL: "General",
                    ABBR: "Gen"
                },
                USN: {
                    FULL: "Admiral",
                    ABBR: "ADM"
                },
                USSF: {
                    FULL: "General",
                    ABBR: "Gen"
                }
            },
            O1E: {
                USAF: {
                    FULL: "Second Lieutenant",
                    ABBR: "2d Lt"
                },
                USAR: {
                    FULL: "Second Lieutenant",
                    ABBR: "2LT"
                },
                USCG: {
                    FULL: "Ensign",
                    ABBR: "ENS"
                },
                USMC: {
                    FULL: "Second Lieutenant",
                    ABBR: "2ndLt"
                },
                USN: {
                    FULL: "Ensign",
                    ABBR: "ENS"
                },
                USSF: {
                    FULL: "Second Lieutenant",
                    ABBR: "2d Lt"
                }
            },
            O2E: {
                USAF: {
                    FULL: "First Lieutenant",
                    ABBR: "1st Lt"
                },
                USAR: {
                    FULL: "First Lieutenant",
                    ABBR: "1LT"
                },
                USCG: {
                    FULL: "Lieutenant (Junior Grade)",
                    ABBR: "LTJG"
                },
                USMC: {
                    FULL: "First Lieutenant",
                    ABBR: "1stLt"
                },
                USN: {
                    FULL: "Lieutenant (Junior Grade)",
                    ABBR: "LTJG"
                },
                USSF: {
                    FULL: "First Lieutenant",
                    ABBR: "1st Lt"
                }
            },
            O3E: {
                USAF: {
                    FULL: "Captain",
                    ABBR: "Capt"
                },
                USAR: {
                    FULL: "Captain",
                    ABBR: "CPT"
                },
                USCG: {
                    FULL: "Lieutenant",
                    ABBR: "LT"
                },
                USMC: {
                    FULL: "Captain",
                    ABBR: "Capt"
                },
                USN: {
                    FULL: "Lieutenant",
                    ABBR: "LT"
                },
                USSF: {
                    FULL: "Captain",
                    ABBR: "Capt"
                }
            }
        }

        return dictionary[grade][serviceLocalization][type];
    }

    return (
        <StorageContext.Provider
            value={{
                sidebarOpen,
                setSidebarOpen,
                retirementMultiplier,
                setRetirementMultiplier,
                serviceLocalization,
                setServiceLocalization,
                promotions,
                setPromotions,
                getRankInsigniaUrl,
                getRankFromGrade,
            }}
        >
            {children}
        </StorageContext.Provider>
    )
}

export const useStorage = () => useContext(StorageContext);