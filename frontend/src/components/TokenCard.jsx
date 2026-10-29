export default function TokenCard({ tokenNumber, position, farmersAhead }) {
  return (
    <div className="border-2 border-green-600 rounded-xl p-6 text-center bg-white">
      <p className="text-gray-500 text-sm">Your Token</p>
      <h1 className="text-4xl font-bold my-1">#{tokenNumber}</h1>
      <p>Position: <strong>#{position}</strong></p>
      <p className="text-gray-500 text-sm">Farmers ahead: {farmersAhead}</p>
    </div>
  );
}