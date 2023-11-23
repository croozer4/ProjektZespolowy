import React, { useEffect } from "react";
import { useState } from "react";
import { Button } from "@mantine/core";
import { MantineProvider, Text } from "@mantine/core";
import FamilyAddingForm from "../components/FamilyAddingForm.tsx";
import DisplayUserFamilies from "../components/DisplayUserFamilies.tsx";
import { auth, db } from "../config/firebase.tsx";
import {
    deleteDoc,
    doc,
    getDocs,
    getDoc,
    where,
    query,
    collection,
    DocumentData,
} from "@firebase/firestore";

import { IconPhoto, IconDownload, IconArrowRight } from "@tabler/icons-react";

import "../styles/FamilyPageStyle.css";
import JoinFamilyForm from "../components/JoinFamilyForm.tsx";
import LeaveFamilyForm from "../components/LeaveFamilyForm.tsx";
import RemoveFamilyForm from "../components/RemoveFamilyForm.tsx";
import PeekMembersForm from "../components/PeekMembersButton.tsx";
import { on } from "events";
import { set } from "date-fns";
import { Menu } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { toast } from "react-toastify";
import { DefaultAlertTime, QuickAlertTime } from "../config/globals.tsx";
import { Timestamp } from "firebase/firestore";
import HistoryComponent from "../components/HistoryComponent.tsx";

import BasicPieChart from "../components/BasicPieChart.tsx";

interface Family {
    id: string;
    name: string;
    admins: string[];
    createdBy: string;
    inviteCode: string;
    members: string[];
    // Dodaj inne właściwości, jeśli istnieją
}

type Expense = {
    id: string;
    category: string;
    creationDate: Timestamp;
    description?: string;
    type: boolean;
    user: string;
    value: number;
};

const FamilyPage = () => {
    const [reload, setReload] = useState<boolean>(true);
    const [userFamily, setUserFamily] = useState<Family | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [members, setMembers] = useState<string[]>([]);
    const [loggedIn, setLoggedIn] = useState<boolean>(true);
    const [selectedMonth, setSelectedMonth] = useState<number>(
        new Date().getMonth() + 1
    ); // Current month
    const [selectedYear, setSelectedYear] = useState<number>(
        new Date().getFullYear()
    ); // Current year
    const [earnings, setEarnings] = useState<number>(0);

    const [familyData, setFamilyData] = useState<Array<Expense>>([]);

    const onUpdate = () => {
        console.log("onUpdate");
        setReload(true);
        window.location.reload();
    };

    useEffect(() => {
        if (auth.currentUser && userFamily?.createdBy) {
            if (userFamily.createdBy === auth.currentUser.uid) {
                setIsAdmin(true);
                console.log("Admin");
            } else {
                console.log("Not Admin");
            }
            console.log(userFamily.createdBy);
            console.log(auth.currentUser.uid);
        }
    }, [userFamily, auth.currentUser]);

    const getFamily = async () => {
        const userId = await auth.currentUser?.uid;

        if (userId) {
            const q = query(
                collection(db, "family"),
                where("members", "array-contains", userId)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const familyData = querySnapshot.docs[0].data() as Family;
                setUserFamily(familyData);
                setMembers(familyData.members);
            } else {
                // Obsługa przypadku braku wyników
                console.log("Brak rodziny dla bieżącego użytkownika.");
            }
        } else {
            // Obsługa przypadku braku zalogowanego użytkownika
            console.log("Brak zalogowanego użytkownika.");
        }
    };

    const fetchData = async () => {
        try {
            const uid = auth.currentUser?.uid || null;

            if (uid) {
                const q = query(
                    collection(db, "usersData"),
                    where("user", "==", uid)
                );

                const querySnapshot = await getDocs(q);

                const fetchedData = querySnapshot.docs.map((doc) => {
                    const docData = doc.data();
                    return {
                        id: doc.id,
                        category: docData.category,
                        creationDate: docData.creationDate,
                        description: docData.description,
                        type: docData.type,
                        user: docData.user,
                        value: docData.value,
                    };
                });

                // Filtruj dane na podstawie wybranego miesiąca i roku
                const filteredData = fetchedData.filter((item) => {
                    const itemDate = new Date(item.creationDate.toMillis());
                    return (
                        itemDate.getFullYear() === selectedYear &&
                        itemDate.getMonth() + 1 === selectedMonth
                    );
                });

                setFamilyData(filteredData);
            }

            fetchMonthlyBudget();
            setReload(false);
        } catch (error) {
            console.error(error);
            toast.error("Wystąpił błąd podczas pobierania danych!", {
                position: "top-center",
                autoClose: DefaultAlertTime,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
    };

    const fetchMonthlyBudget = async () => {
        try {
            const uid = auth.currentUser?.uid || null;
            if (uid) {
                const monthlyBudget = doc(db, "users", uid);
                const docSnap = await getDoc(monthlyBudget);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const monthlyBudget = data?.earnings;
                    setEarnings(monthlyBudget);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(
                "Wystąpił błąd podczas pobierania budżetu miesięcznego!",
                {
                    position: "top-center",
                    autoClose: DefaultAlertTime,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                }
            );
        }
    };

    const fetchFamilyData = async () => {
        try {
            const uid = auth.currentUser?.uid || null;

            console.log("test");

            if (uid) {
                if (members.length > 0) {
                    const q = query(
                        collection(db, "usersData"),
                        where("user", "in", members)
                    );
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const familyData = querySnapshot.docs;
                        const familyDataArray = familyData.map((doc) => {
                            return {
                                id: doc.id,
                                category: doc.data().category,
                                creationDate: doc.data().creationDate,
                                description: doc.data().description,
                                type: doc.data().type,
                                user: doc.data().user,
                                value: doc.data().value,
                            };
                        });
                        setFamilyData(familyDataArray);
                        console.log(familyDataArray);
                    } else {
                        console.log("Brak rodziny dla bieżącego użytkownika.");
                    }
                }
            }

            setReload(false);
        } catch (error) {
            console.error(error);
            toast.error("Wystąpił błąd podczas pobierania danych!", {
                position: "top-center",
                autoClose: DefaultAlertTime,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                getFamily();
            } else {
                // Obsługa przypadku braku zalogowanego użytkownika
                console.log("Brak zalogowanego użytkownika.");
            }
        });

        return () => unsubscribe(); // Czyszczenie subskrypcji przy odmontowywaniu komponentu
    }, [auth.onAuthStateChanged]);

    useEffect(() => {
        // Ta funkcja zostanie wykonana, gdy userFamily zostanie zaktualizowane
        console.log(userFamily);
    }, [userFamily]);

    useEffect(() => {
        if (members.length > 0 && reload) {
            fetchFamilyData();
        }
    }, [members]);

    const colorScheme = "dark";

    const CopyInviteCode = () => {
        const el = document.createElement("textarea");
        el.value = userFamily?.inviteCode || "";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);

        toast.success("Skopiowano do schowka!", {
            position: "top-center",
            autoClose: QuickAlertTime,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "dark",
        });
    };

    return (
        <div className="family-page">
            <MantineProvider theme={{ colorScheme: colorScheme }}>
                <div className="interface">
                    <div className="family-page-header">
                        <Menu shadow="md" width={200}>
                            <Menu.Target>
                                <Button>
                                    Rodzina:{" "}
                                    {userFamily
                                        ? userFamily.name
                                        : "Brak rodziny"}
                                </Button>
                            </Menu.Target>

                            {userFamily && (
                                <Menu.Dropdown>
                                    <Menu.Label>
                                        Kod: {userFamily?.inviteCode}
                                    </Menu.Label>
                                    <Menu.Item onClick={() => CopyInviteCode()}>
                                        Kopiuj do schowka
                                    </Menu.Item>
                                </Menu.Dropdown>
                            )}
                        </Menu>

                        <div className="family-buttons">
                            {!userFamily && (
                                <>
                                    <FamilyAddingForm onUpdate={onUpdate} />
                                    <JoinFamilyForm onUpdate={onUpdate} />
                                </>
                            )}
                            {userFamily && (
                                <>
                                    <PeekMembersForm
                                        onUpdate={onUpdate}
                                        familyId={userFamily.id}
                                    />
                                    {isAdmin && (
                                        <RemoveFamilyForm
                                            onUpdate={onUpdate}
                                            familyId={userFamily.id}
                                        />
                                    )}
                                    {!isAdmin && (
                                        <LeaveFamilyForm
                                            onUpdate={onUpdate}
                                            familyId={userFamily.id}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    {loggedIn ? (
                        <div className="overview">
                            {familyData?.length !== 0 ? (
                                <>
                                    <div id="chart-container">
                                        <BasicPieChart
                                            data={familyData}
                                            earnings={0}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="no-data-message">
                                    <Text
                                        size="xl"
                                        weight={700}
                                        style={{ marginBottom: "1rem" }}
                                    >
                                        Brak danych do wyświetlenia
                                    </Text>
                                    <BasicPieChart
                                        data={familyData}
                                        earnings={0}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="overview">
                            <Text
                                size="xl"
                                weight={700}
                                style={{ marginBottom: "1rem" }}
                            >
                                Witaj w PocketPal!
                            </Text>

                            <BasicPieChart data={familyData} earnings={0} />
                        </div>
                    )}
                    {familyData.length !== 0 && loggedIn ? (
                        <div>
                            <HistoryComponent
                                data={familyData}
                                fetchData={fetchFamilyData}
                            />
                            {/* <Button className='raport_button' onClick={generatePDF}>Generuj raport PDF</Button> */}
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            </MantineProvider>
        </div>
    );
};

export default FamilyPage;
