"""
Legal AI Backend Service
This Python script provides advanced legal analysis capabilities
"""

import json
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime

@dataclass
class LegalAnalysis:
    """Data class for legal analysis results"""
    is_valid: bool
    confidence: float
    analysis: str
    citations: List[str]
    recommendations: List[str]
    risk_level: str
    jurisdiction: Optional[str] = None
    analysis_date: str = None

class LegalVerifier:
    """Advanced Legal Verification System"""
    
    def __init__(self):
        self.legal_databases = {
            'federal': self._load_federal_laws(),
            'state': self._load_state_laws(),
            'case_law': self._load_case_law()
        }
        
    def _load_federal_laws(self) -> Dict:
        """Load federal law database (simplified)"""
        return {
            'constitutional': [
                'First Amendment - Freedom of Speech',
                'Fourth Amendment - Search and Seizure',
                'Fifth Amendment - Due Process',
                'Fourteenth Amendment - Equal Protection'
            ],
            'statutory': [
                'Civil Rights Act',
                'Americans with Disabilities Act',
                'Fair Labor Standards Act',
                'Securities Exchange Act'
            ]
        }
    
    def _load_state_laws(self) -> Dict:
        """Load state law database (simplified)"""
        return {
            'california': [
                'California Civil Code',
                'California Penal Code',
                'California Labor Code'
            ],
            'new_york': [
                'New York Civil Rights Law',
                'New York Penal Law',
                'New York Labor Law'
            ]
        }
    
    def _load_case_law(self) -> List[str]:
        """Load case law database (simplified)"""
        return [
            'Brown v. Board of Education (1954)',
            'Miranda v. Arizona (1966)',
            'Roe v. Wade (1973)',
            'Citizens United v. FEC (2010)'
        ]
    
    def analyze_legal_query(self, query: str, jurisdiction: str = None) -> LegalAnalysis:
        """Analyze a legal query and provide verification"""
        
        # Normalize query
        query_lower = query.lower()
        
        # Determine legal area
        legal_area = self._identify_legal_area(query_lower)
        
        # Check validity
        is_valid, confidence = self._assess_validity(query_lower, legal_area)
        
        # Generate analysis
        analysis = self._generate_analysis(query, legal_area, jurisdiction)
        
        # Find relevant citations
        citations = self._find_citations(query_lower, legal_area, jurisdiction)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(query_lower, legal_area, is_valid)
        
        # Assess risk level
        risk_level = self._assess_risk_level(query_lower, is_valid, confidence)
        
        return LegalAnalysis(
            is_valid=is_valid,
            confidence=confidence,
            analysis=analysis,
            citations=citations,
            recommendations=recommendations,
            risk_level=risk_level,
            jurisdiction=jurisdiction,
            analysis_date=datetime.now().isoformat()
        )
    
    def analyze_legal_document(self, document: str, jurisdiction: str = None) -> LegalAnalysis:
        """Analyze a legal document for compliance and validity"""
        
        # Document structure analysis
        structure_score = self._analyze_document_structure(document)
        
        # Legal compliance check
        compliance_issues = self._check_compliance(document, jurisdiction)
        
        # Risk assessment
        risk_factors = self._identify_risk_factors(document)
        
        # Generate comprehensive analysis
        is_valid = len(compliance_issues) == 0 and structure_score > 0.7
        confidence = min(95, max(50, structure_score * 100 - len(compliance_issues) * 10))
        
        analysis = self._generate_document_analysis(
            document, structure_score, compliance_issues, risk_factors
        )
        
        citations = self._find_document_citations(document, jurisdiction)
        recommendations = self._generate_document_recommendations(compliance_issues, risk_factors)
        risk_level = 'high' if len(compliance_issues) > 2 else 'medium' if len(compliance_issues) > 0 else 'low'
        
        return LegalAnalysis(
            is_valid=is_valid,
            confidence=confidence,
            analysis=analysis,
            citations=citations,
            recommendations=recommendations,
            risk_level=risk_level,
            jurisdiction=jurisdiction,
            analysis_date=datetime.now().isoformat()
        )
    
    def _identify_legal_area(self, query: str) -> str:
        """Identify the area of law based on query content"""
        areas = {
            'contract': ['contract', 'agreement', 'breach', 'terms', 'consideration'],
            'criminal': ['crime', 'criminal', 'arrest', 'charges', 'felony', 'misdemeanor'],
            'civil_rights': ['discrimination', 'civil rights', 'equal protection', 'due process'],
            'employment': ['employment', 'workplace', 'labor', 'wages', 'harassment'],
            'property': ['property', 'real estate', 'landlord', 'tenant', 'lease'],
            'family': ['divorce', 'custody', 'marriage', 'adoption', 'family'],
            'corporate': ['corporation', 'business', 'securities', 'merger', 'acquisition']
        }
        
        for area, keywords in areas.items():
            if any(keyword in query for keyword in keywords):
                return area
        
        return 'general'
    
    def _assess_validity(self, query: str, legal_area: str) -> Tuple[bool, float]:
        """Assess the validity of a legal statement or query"""
        
        # Simplified validity assessment
        validity_indicators = {
            'positive': ['legal', 'valid', 'permitted', 'allowed', 'constitutional'],
            'negative': ['illegal', 'invalid', 'prohibited', 'unconstitutional', 'violation']
        }
        
        positive_count = sum(1 for word in validity_indicators['positive'] if word in query)
        negative_count = sum(1 for word in validity_indicators['negative'] if word in query)
        
        if negative_count > positive_count:
            return False, max(60, 90 - negative_count * 10)
        elif positive_count > 0:
            return True, min(95, 75 + positive_count * 5)
        else:
            return True, 75  # Neutral confidence
    
    def _generate_analysis(self, query: str, legal_area: str, jurisdiction: str) -> str:
        """Generate detailed legal analysis"""
        
        jurisdiction_text = f" in {jurisdiction}" if jurisdiction else ""
        
        analysis = f"""
Legal Analysis for {legal_area.replace('_', ' ').title()} Matter{jurisdiction_text}:

Query: "{query}"

Based on the analysis of your legal query, this matter falls under {legal_area.replace('_', ' ')} law. 

Key Considerations:
1. The legal principles applicable to this situation require careful examination of relevant statutes and case law.
2. Jurisdictional factors{jurisdiction_text} may significantly impact the legal outcome.
3. The specific facts and circumstances of your situation will determine the exact legal requirements and potential outcomes.

Legal Framework:
The applicable legal framework includes both statutory law and common law principles that have developed through court decisions over time. The interpretation and application of these laws can vary based on specific circumstances and jurisdictional differences.

IMPORTANT DISCLAIMER: This analysis is provided for informational purposes only and does not constitute legal advice. The law is complex and fact-specific. You should consult with a qualified attorney who can provide advice tailored to your specific situation and jurisdiction.
        """.strip()
        
        return analysis
    
    def _find_citations(self, query: str, legal_area: str, jurisdiction: str) -> List[str]:
        """Find relevant legal citations"""
        citations = []
        
        # Add area-specific citations
        area_citations = {
            'contract': [
                'Uniform Commercial Code § 2-201 (Statute of Frauds)',
                'Restatement (Second) of Contracts § 71',
                'Hadley v. Baxendale (1854) - Damages'
            ],
            'criminal': [
                'U.S. Constitution Amendment IV (Search and Seizure)',
                'Miranda v. Arizona, 384 U.S. 436 (1966)',
                'Federal Rules of Criminal Procedure'
            ],
            'employment': [
                '29 U.S.C. § 201 et seq. (Fair Labor Standards Act)',
                'Title VII of the Civil Rights Act of 1964',
                '29 U.S.C. § 151 et seq. (National Labor Relations Act)'
            ]
        }
        
        if legal_area in area_citations:
            citations.extend(area_citations[legal_area])
        
        # Add jurisdiction-specific citations
        if jurisdiction:
            citations.append(f"{jurisdiction} State Statutes and Regulations")
            citations.append(f"{jurisdiction} Case Law and Precedents")
        
        # Add general citations
        citations.extend([
            'U.S. Constitution and Bill of Rights',
            'Relevant Federal and State Statutes',
            'Applicable Case Law and Legal Precedents'
        ])
        
        return citations[:5]  # Limit to 5 most relevant
    
    def _generate_recommendations(self, query: str, legal_area: str, is_valid: bool) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if not is_valid:
            recommendations.extend([
                'Consult with a qualified attorney immediately to address potential legal issues',
                'Review and revise any documents or agreements to ensure compliance',
                'Consider alternative approaches that comply with applicable laws'
            ])
        else:
            recommendations.extend([
                'Document all relevant facts and maintain proper records',
                'Consider consulting with an attorney to ensure full compliance',
                'Stay informed about changes in applicable laws and regulations'
            ])
        
        # Add area-specific recommendations
        area_recommendations = {
            'contract': [
                'Ensure all contract terms are clearly defined and enforceable',
                'Include appropriate dispute resolution clauses'
            ],
            'employment': [
                'Review employee handbook and policies for compliance',
                'Ensure proper documentation of employment decisions'
            ],
            'criminal': [
                'Exercise constitutional rights appropriately',
                'Maintain detailed records of any interactions with law enforcement'
            ]
        }
        
        if legal_area in area_recommendations:
            recommendations.extend(area_recommendations[legal_area])
        
        return recommendations[:5]  # Limit to 5 most important
    
    def _assess_risk_level(self, query: str, is_valid: bool, confidence: float) -> str:
        """Assess the risk level of the legal matter"""
        
        high_risk_indicators = ['criminal', 'lawsuit', 'violation', 'penalty', 'fine', 'prosecution']
        medium_risk_indicators = ['dispute', 'disagreement', 'breach', 'non-compliance']
        
        if not is_valid or confidence < 60:
            return 'high'
        elif any(indicator in query for indicator in high_risk_indicators):
            return 'high'
        elif any(indicator in query for indicator in medium_risk_indicators):
            return 'medium'
        else:
            return 'low'
    
    def _analyze_document_structure(self, document: str) -> float:
        """Analyze document structure and completeness"""
        
        # Check for common legal document elements
        elements = {
            'parties': ['party', 'parties', 'between', 'and'],
            'consideration': ['consideration', 'payment', 'exchange'],
            'terms': ['terms', 'conditions', 'obligations'],
            'signatures': ['signature', 'signed', 'executed'],
            'date': ['date', 'dated', 'day of']
        }
        
        document_lower = document.lower()
        score = 0
        
        for element, keywords in elements.items():
            if any(keyword in document_lower for keyword in keywords):
                score += 0.2
        
        return min(1.0, score)
    
    def _check_compliance(self, document: str, jurisdiction: str) -> List[str]:
        """Check document for compliance issues"""
        issues = []
        
        # Check for common compliance issues
        if len(document) < 100:
            issues.append('Document appears to be too brief for a comprehensive legal agreement')
        
        if 'signature' not in document.lower():
            issues.append('Document lacks proper signature requirements')
        
        if 'date' not in document.lower():
            issues.append('Document lacks proper dating')
        
        # Add jurisdiction-specific checks
        if jurisdiction and jurisdiction.lower() == 'california':
            if 'arbitration' in document.lower() and 'waiver' in document.lower():
                issues.append('California has specific requirements for arbitration waivers')
        
        return issues
    
    def _identify_risk_factors(self, document: str) -> List[str]:
        """Identify potential risk factors in the document"""
        risk_factors = []
        
        high_risk_terms = ['penalty', 'liquidated damages', 'indemnification', 'liability', 'breach']
        
        for term in high_risk_terms:
            if term in document.lower():
                risk_factors.append(f'Contains {term} provisions that require careful review')
        
        return risk_factors
    
    def _generate_document_analysis(self, document: str, structure_score: float, 
                                  compliance_issues: List[str], risk_factors: List[str]) -> str:
        """Generate comprehensive document analysis"""
        
        analysis = f"""
Document Analysis Report:

Document Structure Score: {structure_score:.1%}
Compliance Issues Identified: {len(compliance_issues)}
Risk Factors Identified: {len(risk_factors)}

Structural Analysis:
The document has been analyzed for completeness and proper legal structure. A score of {structure_score:.1%} indicates {'good' if structure_score > 0.7 else 'adequate' if structure_score > 0.5 else 'poor'} structural compliance with standard legal document requirements.

Compliance Review:
{'No major compliance issues were identified.' if not compliance_issues else 'The following compliance issues require attention:'}
{chr(10).join(f'• {issue}' for issue in compliance_issues)}

Risk Assessment:
{'No significant risk factors were identified.' if not risk_factors else 'The following risk factors should be considered:'}
{chr(10).join(f'• {factor}' for factor in risk_factors)}

LEGAL DISCLAIMER: This analysis is automated and provided for informational purposes only. It does not constitute legal advice. All legal documents should be reviewed by qualified legal counsel before execution or reliance.
        """.strip()
        
        return analysis
    
    def _find_document_citations(self, document: str, jurisdiction: str) -> List[str]:
        """Find citations relevant to the document type"""
        citations = [
            'Applicable Contract Law Principles',
            'Uniform Commercial Code (if applicable)',
            'State-Specific Contract Requirements'
        ]
        
        if jurisdiction:
            citations.append(f'{jurisdiction} State Contract Law')
            citations.append(f'{jurisdiction} Consumer Protection Laws')
        
        return citations
    
    def _generate_document_recommendations(self, compliance_issues: List[str], 
                                         risk_factors: List[str]) -> List[str]:
        """Generate recommendations for document improvement"""
        recommendations = []
        
        if compliance_issues:
            recommendations.append('Address all identified compliance issues before document execution')
            recommendations.append('Have the document reviewed by qualified legal counsel')
        
        if risk_factors:
            recommendations.append('Carefully review all risk factors and consider mitigation strategies')
            recommendations.append('Ensure all parties understand the implications of high-risk provisions')
        
        recommendations.extend([
            'Maintain copies of all executed documents in a secure location',
            'Review the document periodically to ensure continued compliance',
            'Consider legal insurance or other risk management strategies'
        ])
        
        return recommendations[:5]

# Example usage and testing
def main():
    """Main function for testing the legal verifier"""
    verifier = LegalVerifier()
    
    # Test legal query
    print("=== Legal Query Analysis ===")
    query = "Is it legal to record phone conversations without consent in California?"
    result = verifier.analyze_legal_query(query, "California")
    
    print(f"Query: {query}")
    print(f"Valid: {result.is_valid}")
    print(f"Confidence: {result.confidence}%")
    print(f"Risk Level: {result.risk_level}")
    print(f"Analysis: {result.analysis[:200]}...")
    print(f"Citations: {result.citations[:2]}")
    print(f"Recommendations: {result.recommendations[:2]}")
    
    print("\n" + "="*50 + "\n")
    
    # Test document analysis
    print("=== Document Analysis ===")
    document = """
    This Agreement is entered into between John Doe and Jane Smith.
    The parties agree to the following terms and conditions:
    1. Payment of $1000 due within 30 days
    2. Services to be completed by December 31, 2024
    3. Both parties agree to binding arbitration
    Signed: _________________ Date: _________
    """
    
    doc_result = verifier.analyze_legal_document(document, "California")
    
    print(f"Document Valid: {doc_result.is_valid}")
    print(f"Confidence: {doc_result.confidence}%")
    print(f"Risk Level: {doc_result.risk_level}")
    print(f"Analysis: {doc_result.analysis[:300]}...")
    print(f"Recommendations: {doc_result.recommendations[:3]}")

if __name__ == "__main__":
    main()
