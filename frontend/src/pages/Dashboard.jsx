import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copiedId, setCopiedId] = useState(null);


    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/login");
        }
    }, [user, authLoading, navigate]);


    useEffect(() => {
        if (user) {
            fetchLinks();
        }
    }, [user]);


    async function fetchLinks() {
        try {
            const res = await api.get("/links/my-links");
            setLinks(res.data.links || []);
        } catch {
            setError("Failed to load your links");
        } finally {
            setLoading(false);
        }
    }


    async function handleDelete(id) {
        if (!window.confirm("Delete this link permanently?")) return;

        try {
            await api.delete(`/links/${id}`);

            setLinks((prev) =>
                prev.filter((item) => item.id !== id)
            );

        } catch {
            alert("Failed to delete link");
        }
    }


    async function handleCopy(shortCode, id) {

        const url =
            `${window.location.origin.replace("5173","5000")}/${shortCode}`;

        await navigator.clipboard.writeText(url);

        setCopiedId(id);

        setTimeout(() => {
            setCopiedId(null);
        },2000);
    }


    if(authLoading || loading){
        return(
            <div className="
                min-h-[70vh]
                flex
                items-center
                justify-center
            ">
                <div className="
                    w-10
                    h-10
                    rounded-full
                    border-4
                    border-blue-600
                    border-t-transparent
                    animate-spin
                "/>
            </div>
        )
    }


    const totalClicks = links.reduce(
        (sum,item)=>sum + item.click_count,
        0
    );


    const protectedLinks = links.filter(
        item=>item.has_password
    ).length;


    const expiredLinks = links.filter(
        item =>
        item.expires_at &&
        new Date(item.expires_at)<new Date()
    ).length;



    return (
        <div className="
            max-w-6xl
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            py-10
        ">


            {/* Header */}

            <div className="
                flex
                flex-col
                md:flex-row
                md:justify-between
                md:items-center
                gap-5
                mb-10
            ">

                <div>

                    <p className="
                        text-blue-600
                        font-medium
                        text-sm
                        mb-2
                    ">
                        ✨ Dashboard
                    </p>


                    <h1 className="
                        text-4xl
                        font-bold
                        text-gray-900
                    ">
                        My Links
                    </h1>


                    <p className="
                        text-gray-500
                        mt-2
                    ">
                        Manage, track and analyze your shortened URLs
                    </p>

                </div>



                <button
                    onClick={()=>navigate("/")}
                    className="
                        px-5
                        py-3
                        rounded-2xl
                        bg-blue-600
                        text-white
                        font-medium
                        hover:bg-blue-700
                        transition
                        shadow-lg
                    "
                >
                    🔗 Create Link
                </button>

            </div>



            {/* Stats */}

            <div className="
                grid
                grid-cols-2
                lg:grid-cols-4
                gap-4
                mb-10
            ">

                <StatCard
                    icon="🔗"
                    title="Total Links"
                    value={links.length}
                />

                <StatCard
                    icon="👆"
                    title="Total Clicks"
                    value={totalClicks}
                />

                <StatCard
                    icon="🔒"
                    title="Protected"
                    value={protectedLinks}
                />

                <StatCard
                    icon="⏰"
                    title="Expired"
                    value={expiredLinks}
                />

            </div>

                        {/* Error */}

            {error && (
                <div className="
                    mb-6
                    p-4
                    rounded-2xl
                    bg-red-50
                    border
                    border-red-100
                    text-red-600
                ">
                    {error}
                </div>
            )}



            {/* Links */}

            {links.length === 0 ? (

                <div className="
                    py-24
                    rounded-3xl
                    bg-gray-50
                    border
                    border-dashed
                    border-gray-200
                    text-center
                ">

                    <div className="
                        w-20
                        h-20
                        mx-auto
                        rounded-3xl
                        bg-blue-100
                        flex
                        items-center
                        justify-center
                        text-4xl
                        mb-5
                    ">
                        🔗
                    </div>


                    <h2 className="
                        text-xl
                        font-semibold
                        text-gray-800
                    ">
                        No links created yet
                    </h2>


                    <p className="
                        text-gray-500
                        mt-2
                    ">
                        Create your first shortened URL and start tracking clicks.
                    </p>

                </div>


            ) : (

                <div className="
                    space-y-5
                ">


                    {
                        links.map((link)=>{


                            const shortUrl =
                            `${window.location.origin.replace("5173","5000")}/${link.short_code}`;


                            const qrUrl =
                            `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(shortUrl)}`;


                            const isExpired =
                            link.expires_at &&
                            new Date(link.expires_at)<new Date();



                            return (

                                <div
                                key={link.id}
                                className="
                                    relative
                                    overflow-hidden
                                    w-full
                                    bg-white
                                    rounded-3xl
                                    border
                                    border-gray-200
                                    shadow-sm
                                    hover:shadow-xl
                                    transition
                                "
                                >


                                    {/* Gradient line */}

                                    <div className="
                                        h-1
                                        bg-gradient-to-r
                                        from-blue-500
                                        via-purple-500
                                        to-pink-500
                                    "/>



                                    <div className="
                                        p-5
                                        flex
                                        flex-col
                                        lg:flex-row
                                        gap-5
                                    ">


                                        {/* QR */}

                                        <div className="
                                            shrink-0
                                        ">

                                            <div className="
                                                p-2
                                                rounded-2xl
                                                bg-gray-50
                                                border
                                            ">

                                                <img
                                                    src={qrUrl}
                                                    alt="QR"
                                                    className="
                                                        w-20
                                                        h-20
                                                        rounded-xl
                                                    "
                                                />

                                            </div>

                                        </div>





                                        {/* Information */}

                                        <div className="
                                            flex-1
                                            min-w-0
                                            overflow-hidden
                                        ">


                                            {/* Short URL */}

                                            <div className="
                                                flex
                                                flex-wrap
                                                items-center
                                                gap-2
                                                mb-3
                                            ">


                                                <a
                                                href={shortUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="
                                                    text-blue-600
                                                    font-semibold
                                                    hover:underline
                                                    break-all
                                                "
                                                >

                                                    🔗 {link.short_code}

                                                </a>



                                                {
                                                    link.is_custom &&
                                                    <Badge>
                                                        ⭐ Custom
                                                    </Badge>
                                                }



                                                {
                                                    link.has_password &&
                                                    <Badge danger>
                                                        🔒 Protected
                                                    </Badge>
                                                }



                                                {
                                                    isExpired ?
                                                    <Badge danger>
                                                        Expired
                                                    </Badge>
                                                    :
                                                    link.expires_at &&
                                                    <Badge>
                                                        ⏳ {
                                                        new Date(
                                                            link.expires_at
                                                        )
                                                        .toLocaleDateString()
                                                        }
                                                    </Badge>
                                                }


                                            </div>





                                            {/* Long URL */}

                                            <div className="
                                                bg-gray-50
                                                border
                                                rounded-xl
                                                p-3
                                                mb-4
                                                max-w-full
                                            ">


                                                <p
                                                title={link.long_url}
                                                className="
                                                    text-sm
                                                    text-gray-600
                                                    break-all
                                                    line-clamp-3
                                                "
                                                >

                                                    {link.long_url}

                                                </p>


                                            </div>





                                            {/* Details */}

                                            <div className="
                                                flex
                                                flex-wrap
                                                gap-4
                                                text-sm
                                                text-gray-500
                                            ">


                                                <span>
                                                    📅 {
                                                    new Date(
                                                        link.created_at
                                                    )
                                                    .toLocaleDateString()
                                                    }
                                                </span>


                                                <span>
                                                    👆 {link.click_count} clicks
                                                </span>


                                            </div>


                                        </div>

                                                                                {/* Actions */}

                                        <div className="
                                            flex
                                            lg:flex-col
                                            gap-3
                                            shrink-0
                                        ">


                                            <button
                                            onClick={() =>
                                                handleCopy(
                                                    link.short_code,
                                                    link.id
                                                )
                                            }
                                            className="
                                                px-4
                                                py-2.5
                                                rounded-xl
                                                bg-blue-600
                                                text-white
                                                text-sm
                                                font-medium
                                                hover:bg-blue-700
                                                transition
                                            "
                                            >

                                                📋 {
                                                copiedId === link.id
                                                ? "Copied"
                                                : "Copy"
                                                }

                                            </button>



                                            <button
                                            onClick={() =>
                                                handleDelete(link.id)
                                            }
                                            className="
                                                px-4
                                                py-2.5
                                                rounded-xl
                                                bg-red-50
                                                text-red-600
                                                text-sm
                                                font-medium
                                                hover:bg-red-100
                                                transition
                                            "
                                            >

                                                🗑 Delete

                                            </button>


                                        </div>


                                    </div>


                                </div>

                            )

                        })
                    }


                </div>

            )}


        </div>

    );

}




// -----------------------------
// Stat Card Component
// -----------------------------

function StatCard({
    icon,
    title,
    value
}){

    return (

        <div className="
            bg-white
            rounded-3xl
            border
            border-gray-200
            p-5
            shadow-sm
            hover:shadow-lg
            transition
        ">


            <div className="
                w-12
                h-12
                rounded-2xl
                bg-blue-50
                flex
                items-center
                justify-center
                text-2xl
                mb-4
            ">
                {icon}
            </div>



            <h3 className="
                text-3xl
                font-bold
                text-gray-900
            ">
                {value}
            </h3>



            <p className="
                text-sm
                text-gray-500
                mt-1
            ">
                {title}
            </p>


        </div>

    )

}




// -----------------------------
// Badge Component
// -----------------------------

function Badge({
    children,
    danger=false
}){

    return (

        <span
        className={`
            px-3
            py-1
            rounded-full
            text-xs
            font-medium
            inline-flex
            items-center

            ${
                danger
                ?
                "bg-red-50 text-red-600"
                :
                "bg-blue-50 text-blue-600"
            }
        `}
        >

            {children}

        </span>

    )

}