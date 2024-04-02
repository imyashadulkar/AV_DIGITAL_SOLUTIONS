import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { CONST_STRINGS, TYPES } from "./constants.js";
import { ENV_VAR } from "./env.js";

export const validateToken = (token) => {
  try {
    if (!token) {
      const error = new Error("Access Denied. No JWT found in cookie");
      throw error;
    }
    try {
      const verified = jwt.verify(token, ENV_VAR.JWT_SECRET, {
        algorithms: ["HS256"]
      });
      if (verified) {
        return { success: true, data: jwt.decode(token, ENV_VAR.JWT_SECRET) };
      } else {
        const error = new Error("Access Denied. Reason: JWT not valid");
        throw error;
      }
    } catch (err) {
      const error = new Error(`Access Denied. Reason: ${err.message}`);
      throw error;
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const validateEmail = (_email) => {
  const email = _email.toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validEmail = emailRegex.test(email);
  if (validEmail) {
    return email;
  } else {
    const error = new Error(CONST_STRINGS.EMAIL_NOT_VALID);
    error.meta = { email };
    throw error;
  }
};

export const validatePassword = (password, confirmPassword, email) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{6,})/;
  const validPassword = passwordRegex.test(password);
  if (!validPassword) {
    const error = new Error(CONST_STRINGS.PASSWORD_DOES_NOT_MEET_REQUIREMENTS);
    throw error;
  }
  if (password !== confirmPassword) {
    const error = new Error(
      CONST_STRINGS.CONFIRM_PASSWORD_DOES_NOT_MATCH_WITH_PASSWORD
    );
    error.meta = { email };
    throw error;
  }
};

export const deleteUser = async (key, by, thowErrorIfUserNotFound = true) => {
  let user;
  if (by === "email") {
    user = await User.findOne({ email: key });
  } else if (by === "userId") {
    user = await User.findOne({ userId: key });
  }

  if (!user) {
    if (thowErrorIfUserNotFound) {
      const error = new Error(CONST_STRINGS.USER_NOT_FOUND);
      error.meta = { key };
      throw error;
    } else {
      return;
    }
  }

  const { userId, email } = user;

  const [
    skills,
    shifts,
    employees,
    lines,
    products,
    assignments,
    attendances,
    LlnePlans,
    license,
    organization,
    changeLog
  ] = await Promise.all([
    Skill.findOne({ userId }),
    Shift.findOne({ userId }),
    Employee.findOne({ userId }),
    Line.findOne({ userId }),
    Product.findOne({ userId }),
    Assignment.find({ userId }),
    Attendance.find({ userId }),
    LinePlan.find({ userId }),
    License.findOne({ userId }),
    Organization.findOne({ userId }),
    ChangeLog.findOne({ userId })
    // TODO: add other collections
  ]);

  const data = {
    user,
    skills,
    shifts,
    employees,
    lines,
    products,
    assignments,
    attendances,
    LlnePlans,
    license,
    organization,
    changeLog
  };

  const deletedUser = new DeletedUser({ userId, email, data });
  await deletedUser.save();

  await Promise.all([
    Skill.deleteOne({ userId }),
    Shift.deleteOne({ userId }),
    Employee.deleteOne({ userId }),
    Line.deleteOne({ userId }),
    Product.deleteOne({ userId }),
    Assignment.deleteMany({ userId }),
    Attendance.deleteMany({ userId }),
    LinePlan.deleteMany({ userId }),
    License.deleteOne({ userId }),
    Organization.deleteOne({ userId }),
    ChangeLog.deleteOne({ userId }),
    User.deleteOne({ userId })
  ]);
};

export const validateUser = async (key, by, email, type) => {
  let user;
  if (by === "email") {
    user = await User.findOne({ email: key });
  } else if (by === "userId") {
    user = await User.findOne({ userId: key });
  }

  if (user?.isBlocked === true) {
    const error = new Error(CONST_STRINGS.USER_BLOCKED_BY_ADMIN);
    error.meta = { email };
    throw error;
  }

  if (type === TYPES.EMAIL_VERIFIED) {
    if (!user) {
      const error = new Error(CONST_STRINGS.USER_NOT_FOUND);
      error.meta = { email };
      throw error;
    } else if (!user?.emailVerification?.verified) {
      const error = new Error(CONST_STRINGS.USER_NOT_REGISTERED);
      error.meta = { email };
      throw error;
    }
  } else if (type === TYPES.EMAIL_EXISTS_AND_NOT_VERIFIED) {
    if (!user) {
      const error = new Error(CONST_STRINGS.USER_NOT_FOUND);
      error.meta = { email };
      throw error;
    } else if (user?.emailVerification?.verified) {
      const error = new Error(CONST_STRINGS.USER_ALREADY_REGISTERED);
      error.meta = { email };
      throw error;
    }
  } else if (type === TYPES.EMAIL_DOES_NOT_EXISTS_OR_NOT_VERIFIED) {
    if (user?.emailVerification?.verified) {
      const error = new Error(CONST_STRINGS.USER_ALREADY_REGISTERED);
      error.meta = { email };
      throw error;
    }
  } else if (type === TYPES.EMAIL_DOES_NOT_EXISTS) {
    if (user) {
      const error = new Error(CONST_STRINGS.EMAIL_ALREADY_EXISITS);
      error.meta = { email };
      throw error;
    }
  }
  return user;
};

export const generateCode = () => {
  // Generate a 6-digit verification code
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  return verificationCode;
};

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
};

export const comparePasswordWithHash = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateJwtToken = (dataObject) => {
  const token = jwt.sign(
    {
      ...dataObject
    },
    ENV_VAR.JWT_SECRET,
    { expiresIn: ENV_VAR.JWT_EXPIRATION_IN_MINS * 60 }
  );

  return token;
};

export const getCookieOptions = (type) => {
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: type === "login" ? ENV_VAR.JWT_EXPIRATION_IN_MINS * 60 * 1000 : 0,
    domain: ENV_VAR.ENV !== "local" ? ENV_VAR.COOKIE_DOMAIN : ""
  };
  return cookieOptions;
};

export const validateChangeEmail = async (
  email,
  confirmEmail,
  user,
  userId
) => {
  if (email === user.email) {
    const error = new Error(CONST_STRINGS.NEW_EMAIL_IS_SAME_AS_EXISTING_EMAIL);
    error.meta = { userId };
    throw error;
  }

  await validateUser(email, "email", { email }, TYPES.EMAIL_DOES_NOT_EXISTS);

  if (email !== confirmEmail) {
    const error = new Error(
      CONST_STRINGS.CONFIRM_EMAIL_DOES_NOT_MATCH_WITH_EMAIL
    );
    error.meta = { userId };
    throw error;
  }
};

export const getTNC = async () => {
  const termsAndConditions = {
    heading: "Software Subscription Agreement",
    subHeading: "TERMS AND CONDITIONS",
    content: [
      {
        title: "Definitions",
        content: [
          "PSG Business Solutions, based at Chennai, India is referred to as “Service Provider” And The Business Entity or Organization or Individual intending to register themselves to create an account is referred to as “User”, with the date of this agreement being the date on which the user agrees to the Terms and Conditions by signing electronically as part of registrations during the account creation process."
        ]
      },
      {
        title: "Agreement and Scope",
        content: [
          "These Terms, together with any accepted Order between User and Service provider, comprise the Agreement between User and Service provider. The Agreement governs the User’s use of the Software and Support Services.",
          "Service Provider shall make the Software available to User as a Subscription in accordance with the applicable Order. The Subscription Fees cover the use of the Software (in accordance with the license granted herein) and the provision of Support Services, as further described in the Agreement. These Terms do not apply in respect of any additional services such as any installation, integration, parametrization and/or adaption services related to the Software.",
          "By signing an Order offered by Service provider, which references these Terms or by indicating User acceptance through an “I accept” button or similar electronic acceptance method, User accept the Order and agree to be bound by the Agreement."
        ]
      },
      {
        title: "Delivery",
        content: [
          "Service Provider shall make available to User the Access to the Software Application by the date specified in the Order; and this shall be the date the Software is deemed delivered to User. Alternatively, Service Provider may at Service provider discretion provide User access to the information using a different format, provided any such different format will not affect User the use of the Software.",
          "In respect of new Releases, delivery shall be deemed completed on the date Service Provider make the applicable new Release available to User to access the same.",
          "In the event of changes to the rights granted to User pursuant to an applicable Order (e.g. extension of the Subscription Term, additional metrics, etc.), Service Provider shall provide User with a new certificate and will deactivate User previously issued access key."
        ]
      },
      {
        title: "Support Services",
        content: [
          "Service Provider provide Support Services as part of the Subscription and these Support Services are described in the Support Services Description which forms part of the Agreement.",
          "Service Provider provide Support Services only for the most current Major Release of the Software. To ensure full use of the Support Services, User is advised to update and maintain User Subscription to the latest Major Release."
        ]
      },
      {
        title: "Subscription Rights and Scope",
        content: [
          "Service Provider is and remain exclusive owner of all rights (including without limitation the Proprietary Rights) in and to the Software and Documentation. User is granted a non-exclusive, non-transferable, revocable right to use the Software for the Subscription Term for User’s own internal purposes (which specifically excludes any analysis of third-party data and any use of the Software for other companies/organizations is prohibited). User is responsible for all acts and omissions in breach of the Agreement by any such Users and accordingly, User will ensure that all Users are made aware of the terms of the Agreement applicable to User in use of Software.",
          "User Subscription shall be limited in accordance with the metrics in the applicable Order.",
          "Any additional copies of the Software and other materials Service Provider make available to User are only for User internal backup or archiving purposes. User will treat the Software and provided materials as Confidential Information and shall undertake all required activities to ensure that no third party gains any access to the Software or provided materials.",
          "User will not (i) copy, translate, or otherwise modify or produce derivative works of all or parts of the Software, it being understood that User will be entitled to copy the documentation and materials accompanying the Software as is reasonably required for User internal purposes; (ii) use the Software in breach of applicable laws or for any illegal activities, including without limitation to transfer data and information which is illegal or in breach of third-party Proprietary Rights; (iii)disassemble, reverse engineer, decompile, place at risk or circumvent the functionalities, performance, and/or the security of the Software; (iv) use all or any part of the Software in order to build a competitive and/or similar product or service; or (v)determine whether the Software is within the scope of any patent.",
          "User will be liable to service provider for any damages incurred due to the unauthorized use of the Software, source code, or other materials provided by Service provider, including without limitation, any continued use of the Software outside the Subscription Term and any provision of the Software, source code, or other materials to unauthorized third parties.",
          "Service Provider may audit User use of the Software within the limitations of User Subscription at Service provider own cost by providing User with seven (7) days’ prior written notice. Service Provider may ask a qualified third party, who will be obliged to maintain confidentiality, to perform the audit. User shall keep complete and accurate records to permit an accurate assessment of User compliance with User Subscription. User guarantee that all access rights, documents, information, materials, employees and other required information will promptly be made available to service provider in advance and free of charge to allow service provider to conduct the audit. If the audit reveals that User have used the Software beyond the scope of User Subscription, User will pay all applicable Subscription Fees for such overuse in accordance with Service provider then-current price list together with Service provider costs associated with the audit, within thirty (30) days of Service provider notice. Service provider acceptance of any payment shall be without prejudice to any other rights or remedies Service Provider may have under these Terms, the Order or applicable law."
        ]
      },
      {
        title: "Fees and Payment",
        content: [
          `Where user Order is directly with Service provider: i. (a) Service Provider will invoice the Subscription Fees annually in advance; and (b) unless otherwise agreed upon in the Order, all payments are due in full without deduction or set-off within 30 (thirty) days of the date of Service provider invoice.
          ii. The Subscription Fees are non-refundable and do not include Taxes and User are responsible for all Taxes. If Service Provider are required to pay Taxes based on the Software provided under these Terms, then such Taxes shall be billed to and paid by User. If a deduction or withholding is required by law, User shall pay such additional amount and will ensure that the net amount received by service provider equals the full amount which Service Provider would have received had the deduction or withholding not been required. This Section shall not apply to Taxes based on Service provider income.
          iii. Without prejudice to any other rights Service Provider may have, if Service Provider have not received payment for any overdue invoices, Service Provider may charge User interest at the rate of 1% per month or lesser if such amount is required by applicable law on any overdue sums from the due date until the date of receipt of payment by service provider (inclusive) and service provider shall be entitled to terminate the subscription services to the user on the grounds of payment over dues with or without intimation to the user and with immediate effect
          iv. Service Provider shall be entitled to revise the Subscription Fees with effect from User Subsequent Renewal Term. Where Service Provider increase the Subscription Fees, such increase shall be decided by the service provider on service provider sole discretion and shall be based on par with the Market Economic Conditions, wholesale price index, consumer price index etc. Unless otherwise agreed between User and Service provider, if User are renewing directly with Service provider a Subscription originally purchased through an Authorized Reseller, then the Subscription Fees for User Initial Renewal Term with service provider will be at Service provider then-prevailing Subscription Fees for the subject Software.`,
          "Service Provider shall, any time, introduce/launch new schemes or discontinue/terminate/pause prevailing/existing schemes, at sole service provider discretion, that includes Discounts and Sales Promotion offers to Market that may pass on benefits in terms of discounts on subscription fees/similar other benefits as laid out in the scheme, to Specific Users that are registered under the Schemes by complying to the specific rules/regulations/norms pertaining to the schemes concerned.",
          "If User Subscription is purchased through an Authorized Reseller, Service Provider may, upon written notice, suspend User right to use the Subscription in the event Service Provider fail to receive payment for such Subscription or Service Provider confirm that User have not paid the Authorized Reseller for such Subscription."
        ]
      },
      {
        title: "Data Retention",
        content: [
          "User shall archive the required data such as, assignment output, reports etc., in their own local/cloud servers date wise, on a weekly basis, for their further analysis and inferences as the Service Provider servers is designed not to retain such data for a period of more than 3 months unless otherwise specified explicitly by the service provider.",
          "Service Provider is not liable and responsible in case if user does not archive the required reports and data as decided by the user as per section 7.1"
        ]
      },
      {
        title: "Term and Termination",
        content: [
          "User Subscription commences on the effective date of the Order unless otherwise specified therein. User Subscription continues for the Initial Subscription Term stated in the Order. Thereafter, the Subscription will automatically renew for successive periods of 12 months (each a “Renewal Term”) unless a party gives 30 days prior written notice to the other party of its intention not to renew the Subscription. Unless otherwise agreed in the applicable Order, User Subscription may only be terminated in accordance with Section 8.2.",
          `Without prejudice to any other rights or remedies to which Service Provider or User may be entitled, either party may terminate an Order, Subscription or this Agreement without liability to the other at any time with immediate effect upon written notice if the other party:",
          a. is in material breach of any of its obligations under the Agreement or an Order and, in the case of a breach which is capable of remedy, fails to remedy such breach within thirty (30) days of notice of the breach; or",
          b. voluntarily files a petition under bankruptcy or insolvency law; has a receiver or administrative receiver appointed over it or any of its assets; passes a resolution for winding-up) or a court of competent jurisdiction makes an order to that effect; becomes subject to an administration order; enters into any voluntary arrangement with its creditors; ceases or threaten to cease to carry on business; or is subject to any analogous event or proceeding in any applicable jurisdiction.`,
          "Termination of any Order shall have no effect on any other Order under this Agreement.",
          "On termination of User Subscription or this Agreement for any reason, User shall cease use of the Software and copies thereof and, at User choice, either (i) delete them from all User equipment and storage media and certify to service provider in writing that you have done so; or (ii) return these items to Service provider."
        ]
      },

      {
        title: "Limited Warranties",
        content: [
          "Subject to limitations in this Section, Service Provider warrants that the Software and any Releases shall substantially perform as specified in the Documentation during the Subscription Term, when used in accordance with the terms of the Agreement. Support Services will be rendered with due care, skill and ability, and in accordance with recognized standard of good practice.",
          `Service Provider does not warrant any specifications other than those set out in the Documentation, including without limitation statements made in presentations of the Software, Service provider public statements or advertising campaigns. Any warranty other than the limited warranty set out in Section 9.1 must be made in writing and confirmed by Service provider. User acknowledge and are aware that, in accordance with the current state of technology, the Software can never be fully error-free, or operate entirely without interruption.
          a. Service Provider particularly do not warrant against problems caused by User in use of the Software with any third-party software, misuse, improper testing, unauthorized attempts to repair, modifications or customizations to the Software by User or any other cause beyond the range of the intended use of the Software
          b. Service Provider do not warrant against any Malware, data breaches and data losses which could not have been avoided by adequate, state-of-the art security in accordance with Service provider then-current security practices; or
          c. that the Software will achieve User intended results, nor that the Software have been developed to meet User individual requirements.`,
          "During the Subscription Term, if the Software do not conform with the warranty provided in Section 9.1, Service Provider will at Service provider expense correct any such non-conformance or provide User with an alternative means of accomplishing the desired performance. If Service Provider cannot reasonably make such correction or substitution, in spite of reasonable and genuine efforts, the service provider is not liable to any form of refund to user unless otherwise agreed by service provider on ad-hoc basis.",
          "Warranty claims asserted under one Order shall have no effect on any other Orders or other contracts that are in place between User and Service provider.",
          "To The Maximum Extent Permitted By Applicable Law, The Warranties And Remedies Provided In This Section Are Exclusive And In Lieu Of All Other Warranties, Express, Implied Or Statutory, Including Warranties Of Merchantability, Accuracy, Correspondence With Description, Fitness For A Purpose, Satisfactory Quality And Non-Infringement, All Of Which Are, To The Maximum Extent Permitted By Applicable Law, Expressly Disclaimed By Service Provider, Service Provider Affiliates, Subcontractors And Suppliers.",
          "User agree that User purchase of the Software is not contingent on the delivery of any future functionality or features, or dependent on any oral or written public comments, statements or representations Service Provider made regarding future functionality or features."
        ]
      },
      {
        title: "Generic Terms on Business Integrity and Ethics",
        content: [
          "User shall access the assign-by-skill package/Modules of the package only for the Intended Purpose of the assign-by-skill package/Modules of the package",
          "User shall not indulge in any form of reselling /sub selling/ redistribution of the subscription of the assign-by-skill package",
          "User shall use the Subscription, for the Factory/Premises/Location/Address registered only and the subscription is not transferable to any other Factory/Premises/Location/Address for usage",
          "User shall renew the subscription on or before the expiry date failing which subscription and access shall be blocked / De-activated",
          "User shall follow a high degree of ethical and standard business practices with integrity",
          "Service Provider shall not be held liable/responsible for outage of cloud servers and outage of internet connectivity, Mobile phone signal problems at the Users Locations",
          "Service Provider shall not be held liable/responsible for any sort of inaccuracy/errors in input data that affect the quality of output/solution",
          "Service Provider is authorized to include or exclude, add or delete, upgrade or downgrade the features and functionality of the package and does not require any permission from the users for doing the same"
        ]
      },
      {
        title: "Limitation of Liability",
        content: [
          "Subject to section 11.4, service provider is not liable to user for or in respect of any loss or damage suffered by user under or in connection with the agreement (whether due to breach of contract, tort (including negligence) or otherwise).",
          "To the maximum extent permitted by applicable law and subject to section 11.4, in no event will service provider be liable for special, consequential, incidental, or other indirect damages, including, but not limited to, loss of profits, anticipated savings, business opportunity, goodwill, loss of revenue, or costs of procurement of substitute goods or services arising out of the agreement, however caused and under any theory of liability (including contract, tort, negligence or otherwise), even if service provider have been advised of the possibility of such damages.",
          "Service provider and user both acknowledge that the fees are based in part on the limitations in this section.",
          "The limitations in this section shall not apply to service provider any liability for death or personal injury caused by service provider negligence or that of service provider officers, employees, contractors or agents; fraud or fraudulent misrepresentation; or any other liability which cannot be limited or excluded by applicable law.",
          "User acknowledge and agree that user shall be responsible for producing back-ups of user data."
        ]
      },
      {
        title: "Confidentiality",
        content: [
          "Each party retains all rights in its Confidential Information. Both parties undertake to treat as confidential all of the other party’s Confidential Information acquired before and in connection with performance of the Agreement and to use such Confidential Information only to perform the Agreement. Confidential Information shall not be reproduced in any form except as required to accomplish the intent of the Agreement. Any reproduction of Confidential Information of the other party shall contain any and all confidential or proprietary notices or legends which appear on the original.",
          "A party which becomes aware of a suspected or actual breach of confidentiality, misuse or unauthorized dissemination relating to the other party’s Confidential Information shall inform the other party in writing without undue delay.",
          "Section 12.1 shall not apply to any Confidential Information that: (a) is independently developed by the receiving party without reference to the disclosing party’s Confidential Information, (b) is lawfully received free of restriction from a third party having the right to furnish such Confidential Information; (c) has become generally available to the public without a contractual breach by the receiving party; (d) at the time of disclosure, was known to the receiving party free of restriction; (e) the disclosing party has agreed in writing to be free of such restrictions; or (f) has to be disclosed pursuant to statutory law or court, administrative or governmental order.",
          "Upon request, the receiving party shall destroy or return to the disclosing party all materials containing any of the Confidential Information and any copies or derivatives prepared therefrom. However, this obligation to return or destroy Confidential Information shall not apply to copies of electronically-exchanged Confidential Information made as a matter of routine information technology backup and to Confidential Information or copies thereof which must be stored by the receiving party according to provisions of mandatory law, provided that such Confidential Information or copies thereof shall remain subject to the confidentiality obligations under this Agreement.",
          "The obligations in this Section shall, with respect to each disclosure of Confidential Information, apply forever from its first disclosure, provided, however, that trade secrets shall be protected until they are no longer trade secrets under applicable law."
        ]
      },
      {
        title: "Feedback",
        content: [
          "User may, at User sole discretion, provide User input regarding the Software, products, services, business or technology plans, including, without limitation, comments or suggestions regarding the possible creation, modification, correction, improvement or enhancement of the Software, products and/or services, or input as to whether User believe Service Provider development direction is consistent with User own business and IT needs (collectively “Feedback”). Service Provider shall be entitled to use Feedback for any purpose without notice, restriction or remuneration of any kind to User and/or User representatives.",
          "User acknowledge that any information that Service Provider may disclose to User related to the Software, Service provider other products, services, business or technology plans, under an Order or otherwise, is only intended as a discussion of possible strategies, developments, and functionalities of Service provider products or services and is not intended to be binding on service provider regarding any particular course of business, product strategy, and/or development."
        ]
      },
      {
        title: "General Provisions",
        content: [
          "Sub-contracting: Service Provider may subcontract all or part of Service Provider obligations under the Agreement to a qualified third party. Service Provider may also at any time involve any of Service Provider Affiliates and successors in business as sub-contractors under this Agreement. In such event, Service Provider will be liable for any such sub-contractors used in the performance of Service Provider obligations under the Agreement.",
          "Assignment: Except as permitted herein, neither party may assign the Agreement, in whole or in part, without the prior written consent of the other, not to be unreasonably withheld. Any attempt by either party to assign or transfer the Agreement without the prior written consent of the other will be null and void. Notwithstanding the foregoing, Service Provider may at any time upon notice to User assign or otherwise transfer Service Provider rights and obligations under the Agreement to any of Service Provider Affiliates or successors in business.",
          "Independent Contractors: The relationship between User and Service Provider is that of independent contractors. The Agreement does not create a partnership, franchise, joint venture, agency, fiduciary, employment, or any such similar relationship between User and Service Provider.",
          "Governing Law: The Agreement shall be governed by the laws of Chennai, India, and the parties submit to the exclusive jurisdiction of the courts in Chennai, India.",
          "Amendments: Any amendments or additions to the Agreement must be made in writing and executed by duly authorized representatives of both parties.",
          "Entire Agreement: These Terms, together with any Order between User and Service Provider, constitute the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior agreements between the parties, whether written or oral, relating to the same subject matter. In the event of any inconsistencies between these Terms and an Order between User and Service Provider, the Order shall take precedence over these Terms. Any purchase order, purchasing terms, general terms of business, or other documents issued by User are for administrative convenience only and will not be binding on Service Provider.",
          "Severability: Should parts of the Agreement be or become invalid, this shall not affect the validity of the remaining provisions of the Agreement, which shall remain unaffected. The invalid provision shall be replaced by the parties with such term which comes as close as possible, in a legally permitted manner, to the commercial terms intended by the invalid provision.",
          "No Waiver: No waiver by either party of any breach or default or exercise of a right of a party under the Agreement shall be deemed to be a waiver of any preceding or subsequent breach or default or exercise of a right.",
          "Export Control and Compliance with Laws: The Software is subject to the export control laws of various countries. User agrees that User will not submit the Software to any government agency for licensing consideration or other regulatory approval without Service Provider's prior written consent, and will not export the Software to countries, persons, or entities prohibited by such laws. User is also responsible for complying with all applicable legal regulations of the country where User are registered, and any foreign countries with respect to the use of Software by User and User Affiliates.",
          "Third Party Rights: A person who is not a party to the Agreement has no rights to enforce or enjoy the benefit of any term of this Agreement, but this does not affect any right or remedy of a third party which exists or is available under applicable law or that is expressly provided for under this Agreement.",
          "Notices: Except as otherwise specified in the Agreement, all notices hereunder shall be in writing and shall be deemed to have been given upon: (i) personal delivery, (ii) two business days after sending by e-mail. E-mails to User shall be addressed to the administrative contact designated in User Order. Notices relating to an Infringement Claim under Section 10 must be sent by registered mail and e-mail.",
          "Force Majeure: Neither party shall be in breach of its obligations under this Agreement (other than payment obligations) or incur any liability to the other party for any delay or failure to perform its obligations hereunder if and to the extent such delay or non-performance is caused by a Force Majeure Event. The party affected by the Force Majeure Event shall: (i) promptly inform the other party of such delay or non-performance; (ii) use commercially reasonable efforts to avoid or remove the underlying cause of the delay or non-performance; and (iii) resume performance hereunder as soon as reasonably practical following the removal of the Force Majeure Event.",
          "Surviving Provisions: The terms which, by their nature, are intended to survive termination or expiration of the Agreement shall survive any such termination and expiration, including without limitation the following Sections: 6.1 to 14."
        ]
      }
    ]
  };
  return termsAndConditions;
};
