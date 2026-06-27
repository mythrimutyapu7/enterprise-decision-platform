import { motion } from "framer-motion";

interface Props {
    analysis: any;
}

export default function RiskScoreCard({ analysis }: Props) {

    const score = analysis.risk_score || 0;

    const confidence = analysis.confidence || 0;

    const color =
        score >= 85
            ? "text-red-400"
            : score >= 70
            ? "text-orange-400"
            : score >= 50
            ? "text-yellow-400"
            : "text-green-400";

    const progress =
        score >= 100 ? 100 : score;

    return (

        <motion.div
            initial={{ opacity:0,y:20 }}
            animate={{ opacity:1,y:0 }}
            className="rounded-3xl border border-slate-700 bg-[#121826] p-8 shadow-xl"
        >

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-xs uppercase tracking-[0.35em] text-blue-400">
                        AI RISK ASSESSMENT
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-white">
                        Risk Evaluation
                    </h2>

                </div>

                <div className="text-right">

                    <p className="text-xs uppercase text-slate-500">
                        Confidence
                    </p>

                    <h3 className="text-xl font-bold text-white">
                        {confidence}%
                    </h3>

                </div>

            </div>

            {/* Risk Score */}

            <div className="mt-8">

                <div className="flex items-end gap-4">

                    <h1 className={`text-7xl font-bold ${color}`}>
                        {score}
                    </h1>

                    <span className="pb-3 text-slate-400">
                        /100
                    </span>

                </div>

                <div className="mt-6 h-4 overflow-hidden rounded-full bg-slate-800">

                    <motion.div
                        initial={{ width:0 }}
                        animate={{ width:`${progress}%` }}
                        transition={{ duration:1 }}
                        className={`h-full rounded-full ${
                            score>=85
                            ? "bg-red-500"
                            : score>=70
                            ? "bg-orange-500"
                            : score>=50
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                    />

                </div>

                <p className="mt-3 text-sm text-slate-400">

                    Overall Risk Level :

                    <span className={`ml-2 font-semibold ${color}`}>

                        {analysis.risk_level}

                    </span>

                </p>

            </div>

            {/* Indicators */}

            <div className="mt-10">

                <h3 className="mb-4 text-lg font-semibold text-white">

                    Indicators

                </h3>

                <div className="space-y-3">

                    {analysis.indicators?.map((item:string,index:number)=>(

                        <div
                            key={index}
                            className="rounded-xl border border-slate-700 bg-slate-900 p-4"
                        >

                            <p className="text-slate-300">

                                • {item}

                            </p>

                        </div>

                    ))}

                </div>

            </div>

            {/* Risks */}

            <div className="mt-10">

                <h3 className="mb-4 text-lg font-semibold text-white">

                    Potential Risks

                </h3>

                <div className="space-y-3">

                    {analysis.risks?.map((item:string,index:number)=>(

                        <div
                            key={index}
                            className="rounded-xl border border-red-500/20 bg-red-500/5 p-4"
                        >

                            <p className="text-red-200">

                                {item}

                            </p>

                        </div>

                    ))}

                </div>

            </div>

            {/* Missing Information */}

            <div className="mt-10">

                <h3 className="mb-4 text-lg font-semibold text-white">

                    Missing Information

                </h3>

                <div className="space-y-3">

                    {analysis.missing_information?.map((item:string,index:number)=>(

                        <div
                            key={index}
                            className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4"
                        >

                            <p className="text-yellow-100">

                                {item}

                            </p>

                        </div>

                    ))}

                </div>

            </div>

            {/* Opportunities */}

            <div className="mt-10">

                <h3 className="mb-4 text-lg font-semibold text-white">

                    Opportunities

                </h3>

                <div className="space-y-3">

                    {analysis.opportunities?.map((item:string,index:number)=>(

                        <div
                            key={index}
                            className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"
                        >

                            <p className="text-emerald-200">

                                {item}

                            </p>

                        </div>

                    ))}

                </div>

            </div>

        </motion.div>

    );

}